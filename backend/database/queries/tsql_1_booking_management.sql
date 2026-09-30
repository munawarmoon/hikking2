/*
================================================================================
HIKKING PROJECT - ADVANCED DATABASE OPERATIONS
BOOKING MANAGEMENT
Target DBMS : Microsoft SQL Server (T-SQL)
Member      : ______________________________
Tables      : bookings, payments, reviews, hotels, package_hotels
================================================================================
  Part           Object                                         Status
  1. View        OutstandingBookings                            existing
  2. Procedure   sp_TravelerBookingStatus                       existing
  3. Trigger     trg_booking_notify_guide                       NEW (T-SQL port)
  4. Transaction BEGIN TRY + SAVE TRANSACTION                   existing
================================================================================
*/

-- CREATE VIEW (OutstandingBookings) with Aggregation & CASE Logic

IF OBJECT_ID('OutstandingBookings', 'V') IS NOT NULL
    DROP VIEW OutstandingBookings;
GO

CREATE VIEW OutstandingBookings
AS
SELECT
    b.booking_id AS BookingID,
    u.name AS TravelerName,
    u.email AS TravelerEmail,
    p.title AS PackageTitle,
    d.name AS DestinationName,
    b.travel_date AS TravelDate,
    b.total_travelers AS TotalTravelers,
    b.total_price AS TotalPrice,
    b.booking_status AS BookingStatus,
    COALESCE(SUM(CASE WHEN pay.payment_status = 'paid' THEN pay.amount ELSE 0 END), 0)
        AS PaidAmount,
    COALESCE(SUM(CASE WHEN pay.payment_status IN ('pending', 'failed') THEN pay.amount ELSE 0 END), 0)
        AS UnpaidAmount
FROM bookings AS b
INNER JOIN users AS u ON b.traveler_id = u.id
INNER JOIN packages AS p ON b.package_id = p.id
INNER JOIN destinations AS d ON p.destination_id = d.destination_id
LEFT JOIN payments AS pay ON b.booking_id = pay.booking_id
WHERE b.booking_status IN ('pending', 'confirmed')
GROUP BY
    b.booking_id,
    u.name,
    u.email,
    p.title,
    d.name,
    b.travel_date,
    b.total_travelers,
    b.total_price,
    b.booking_status;
GO

-- Test View
SELECT * FROM OutstandingBookings
ORDER BY TravelDate;

-- STORED PROCEDURE (sp_TravelerBookingStatus) with Parameters, IF/ELSE & CASE

IF OBJECT_ID('sp_TravelerBookingStatus', 'P') IS NOT NULL
    DROP PROCEDURE sp_TravelerBookingStatus;
GO

CREATE PROCEDURE sp_TravelerBookingStatus
    @TravelerID BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Name VARCHAR(150);
    DECLARE @BookingCount INT;
    DECLARE @TotalSpend DECIMAL(10,2);
    DECLARE @TotalUnpaid DECIMAL(10,2);
    DECLARE @Status VARCHAR(20);

    -- 1. Fetch traveler name
    SELECT @Name = name FROM users
    WHERE id = @TravelerID;

    -- Edge case: Traveler does not exist
    IF @Name IS NULL
    BEGIN
        PRINT 'Traveler with ID ' + CAST(@TravelerID AS VARCHAR(20)) + ' does not exist.';
        RETURN;
    END;

    -- 2. Count bookings
    SELECT @BookingCount = COUNT(*) FROM bookings
    WHERE traveler_id = @TravelerID;

    -- Edge case: No booking records
    IF @BookingCount = 0
    BEGIN
        PRINT @Name + ' has no booking record.';
        SELECT @Name AS Name, 0 AS BookingCount, 0.00 AS TotalSpend, 0.00 AS TotalUnpaid, 'Clear' AS Status;
        RETURN;
    END;

    -- 3. Total spend
    SELECT @TotalSpend = COALESCE(SUM(total_price), 0)
    FROM bookings
    WHERE traveler_id = @TravelerID;

    -- 4. Total unpaid / pending payments
    SELECT @TotalUnpaid =
        COALESCE(SUM(CASE WHEN pay.payment_status IN ('pending', 'failed') THEN pay.amount ELSE 0 END), 0)
    FROM bookings AS b
    LEFT JOIN payments AS pay ON b.booking_id = pay.booking_id
    WHERE b.traveler_id = @TravelerID;

    -- 5. Business logic status
    SET @Status =
        CASE
            WHEN @TotalUnpaid >= 10000 THEN 'Blocked'
            WHEN @TotalUnpaid >= 3000  THEN 'Warning'
            ELSE 'Clear'
        END;

    -- Result set output
    SELECT
        @Name AS Name,
        @BookingCount AS BookingCount,
        @TotalSpend AS TotalSpend,
        @TotalUnpaid AS TotalUnpaid,
        @Status AS Status;
END;
GO

-- Test Cases for sp_TravelerBookingStatus
EXEC sp_TravelerBookingStatus @TravelerID = 5; -- Aiman Ahmed (Clear)
EXEC sp_TravelerBookingStatus @TravelerID = 7; -- Nusrat Jahan (Blocked: unpaid >= 10000)
EXEC sp_TravelerBookingStatus @TravelerID = 6; -- Tanvir Rahman (Clear)
EXEC sp_TravelerBookingStatus @TravelerID = 1; -- Admin/No bookings


-- TRIGGER: trg_booking_notify_guide (AFTER INSERT ON bookings)
-- Notun booking hole package-er guide-ke automatic notification pathay

IF OBJECT_ID('trg_booking_notify_guide', 'TR') IS NOT NULL
    DROP TRIGGER trg_booking_notify_guide;
GO

CREATE TRIGGER trg_booking_notify_guide
ON bookings
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Multi-row insert-e-o kaj kore (inserted table-e ekadhik row thakte pare)
    INSERT INTO notifications
        (notification_id, user_id, type, message, is_read, created_at, updated_at)
    SELECT
        (SELECT ISNULL(MAX(notification_id), 0) FROM notifications)
            + ROW_NUMBER() OVER (ORDER BY i.booking_id),
        gp.user_id,
        'new_booking',
        CONCAT(u.name, ' booked "', p.title, '" on ',
               CONVERT(VARCHAR(10), i.travel_date, 23)),
        0, GETDATE(), GETDATE()
    FROM inserted AS i
    INNER JOIN packages       AS p  ON p.id  = i.package_id
    INNER JOIN guide_profiles AS gp ON gp.id = p.guide_profile_id   -- guide na thakle row-i asbe na
    INNER JOIN users          AS u  ON u.id  = i.traveler_id;
END;
GO

-- Test 1: Trigger MUST fire
INSERT INTO bookings
    (booking_id, traveler_id, package_id, travel_date, total_travelers, total_price, booking_status, created_at, updated_at)
VALUES
    (2101, 5, 1, '2026-12-30', 1, 5000.00, 'pending', GETDATE(), GETDATE());

SELECT TOP 3 * FROM notifications ORDER BY notification_id DESC;

-- EXPLICIT TRANSACTION with SAVEPOINT, TRY/CATCH & Partial Rollback

BEGIN TRY
    BEGIN TRANSACTION;

    -- Step 1: Create primary booking record
    INSERT INTO bookings
        (booking_id, traveler_id, package_id, travel_date, total_travelers, total_price, booking_status, created_at, updated_at)
    VALUES
        (2001, 5, 2, '2026-12-15', 2, 29000.00, 'pending', GETDATE(), GETDATE());

    -- Savepoint after the first operation succeeds
    SAVE TRANSACTION AfterBookingCreated;

    -- Step 2: Attempt to record transaction payment
    INSERT INTO payments
        (payment_id, booking_id, transaction_id, amount, payment_status, created_at, updated_at)
    VALUES
        (2001, 2001, 'TXN-SAVEPOINT-TEST-001', 29000.00, 'paid', GETDATE(), GETDATE());

    -- Step 3: Confirm booking once payment is recorded
    UPDATE bookings
    SET booking_status = 'confirmed', updated_at = GETDATE()
    WHERE booking_id = 2001;

    COMMIT TRANSACTION;
    PRINT 'Transaction committed successfully.';
END TRY
BEGIN CATCH
    DECLARE @ErrorNumber INT = ERROR_NUMBER();
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();

    -- If the transaction is active and committable, roll back to savepoint
    -- (Booking remains saved as 'pending', payment rollback is isolated)
    IF XACT_STATE() = 1
    BEGIN
        ROLLBACK TRANSACTION AfterBookingCreated;
        COMMIT TRANSACTION;
        PRINT 'Partial rollback: Booking preserved as pending. Error: ' + @ErrorMessage;
    END
    -- If transaction is completely uncommittable, perform full rollback
    ELSE IF XACT_STATE() = -1
    BEGIN
        ROLLBACK TRANSACTION;
        PRINT 'Full rollback executed. Error: ' + @ErrorMessage;
    END;

    IF @ErrorNumber = 547
        PRINT 'FOREIGN KEY or CHECK constraint violation caught.';
END CATCH;

-- Verification Queries
SELECT * FROM bookings WHERE booking_id = 2001;
SELECT * FROM payments WHERE booking_id = 2001;