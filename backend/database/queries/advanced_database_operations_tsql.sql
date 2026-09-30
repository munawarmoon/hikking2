/*
================================================================================
HIKKING PROJECT - ADVANCED DATABASE OPERATIONS
================================================================================
*/


--Table Creation with PK, FK, UNIQUE, CHECK Constraints & Test Data

IF OBJECT_ID('Reservations', 'U') IS NOT NULL
    DROP TABLE Reservations;

CREATE TABLE Reservations (
    ResID INT PRIMARY KEY,
    TravelerID BIGINT NOT NULL,
    PackageID BIGINT NOT NULL,
    ResDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    TotalTravelers INT NOT NULL DEFAULT 1,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT FK_Reservations_Users
        FOREIGN KEY (TravelerID) REFERENCES users(id),
    CONSTRAINT FK_Reservations_Packages
        FOREIGN KEY (PackageID) REFERENCES packages(id),
    CONSTRAINT UQ_Reservations_TravelerPackageDate
        UNIQUE (TravelerID, PackageID, ResDate),
    CONSTRAINT CK_Reservations_Travelers
        CHECK (TotalTravelers >= 1 AND TotalTravelers <= 20),
    CONSTRAINT CK_Reservations_Status
        CHECK (Status IN ('Pending', 'Confirmed', 'Collected', 'Cancelled'))
);

-- Insert Valid Reservation 1
INSERT INTO Reservations (ResID, TravelerID, PackageID, TotalTravelers, Status)
VALUES (1, 5, 1, 2, 'Pending');

-- Verify Insertion
SELECT * FROM Reservations
WHERE ResID = 1;

-- Insert Valid Reservation 2 (different package)
INSERT INTO Reservations (ResID, TravelerID, PackageID, TotalTravelers, Status)
VALUES (2, 5, 2, 1, 'Confirmed');

-- Insert Valid Reservation 3 (different traveler, same package)
INSERT INTO Reservations (ResID, TravelerID, PackageID, TotalTravelers, Status)
VALUES (3, 6, 1, 3, 'Pending');

-- Display All Reservations
SELECT * FROM Reservations;



-- Multi-Table JOIN with Sorting

SELECT
    u.name AS TravelerName,
    p.title AS PackageTitle,
    d.name AS DestinationName,
    g.name AS GuideName,
    b.travel_date AS TravelDate,
    b.total_travelers AS TotalTravelers,
    b.total_price AS TotalPrice,
    b.booking_status AS BookingStatus
FROM users AS u
INNER JOIN bookings AS b ON u.id = b.traveler_id
INNER JOIN packages AS p ON b.package_id = p.id
INNER JOIN destinations AS d ON p.destination_id = d.destination_id
LEFT JOIN guide_profiles AS gp ON p.guide_profile_id = gp.id
LEFT JOIN users AS g ON gp.user_id = g.id
ORDER BY
    u.name ASC,
    b.travel_date DESC;



-- GROUP BY with HAVING Clause & Aggregate Functions

SELECT
    d.name AS DestinationName,
    COUNT(p.id) AS NumberOfPackages,
    AVG(p.price) AS AveragePrice,
    MIN(p.price) AS MinimumPrice,
    MAX(p.price) AS MaximumPrice
FROM destinations AS d
INNER JOIN packages AS p ON d.destination_id = p.destination_id
GROUP BY
    d.name
HAVING
    AVG(p.price) > 8000
ORDER BY
    AveragePrice DESC;



-- Scalar Subquery with Comparison

SELECT
    id AS PackageID,
    title AS PackageTitle,
    price AS Price,
    duration_days AS DurationDays
FROM packages
WHERE price >
(
    SELECT AVG(price) FROM packages
)
ORDER BY
    price DESC;



-- Correlated Subquery with NOT EXISTS (Universal Quantification)
-- Find travelers who have booked ALL packages under destination 'Cox''s Bazar'

SELECT
    u.id AS TravelerID,
    u.name AS TravelerName,
    u.email AS TravelerEmail
FROM users AS u
WHERE u.role = 'traveler'
AND NOT EXISTS
(
    SELECT 1 FROM packages AS p
    INNER JOIN destinations AS d ON p.destination_id = d.destination_id
    WHERE d.name = 'Cox''s Bazar'
    AND NOT EXISTS
    (
        SELECT 1 FROM bookings AS b
        WHERE b.traveler_id = u.id AND b.package_id = p.id
    )
);



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



-- STORED PROCEDURE (sp_ReviewPackages) with WHILE Loop & Conditional Updates

IF OBJECT_ID('sp_ReviewPackages', 'P') IS NOT NULL
    DROP PROCEDURE sp_ReviewPackages;
GO

CREATE PROCEDURE sp_ReviewPackages
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PkgID BIGINT = 1;
    DECLARE @MaxID BIGINT;
    DECLARE @Title VARCHAR(200);
    DECLARE @Price DECIMAL(10,2);
    DECLARE @BookingCount INT;

    SELECT @MaxID = COALESCE(MAX(id), 0) FROM packages;

    WHILE @PkgID <= @MaxID
    BEGIN
        SET @Title = NULL;

        SELECT @Title = title, @Price = price
        FROM packages
        WHERE id = @PkgID;

        IF @Title IS NOT NULL
        BEGIN
            SELECT @BookingCount = COUNT(*)
            FROM bookings
            WHERE package_id = @PkgID;

            -- High demand: promote to published
            IF @BookingCount >= 3
            BEGIN
                UPDATE packages
                SET status = 'published'
                WHERE id = @PkgID;
            END
            -- Zero demand: apply 10% discount to stimulate bookings
            ELSE IF @BookingCount = 0
            BEGIN
                UPDATE packages
                SET price = ROUND(price * 0.90, 2)
                WHERE id = @PkgID;
            END;

            PRINT @Title + ': ' + CAST(@BookingCount AS VARCHAR(10)) + ' booking(s)';
        END;

        SET @PkgID = @PkgID + 1;
    END;
END;
GO

-- Execute Review Packages Procedure
EXEC sp_ReviewPackages;

-- Verify Updated Packages
SELECT id, title, price, status
FROM packages
ORDER BY id;



-- AFTER UPDATE TRIGGER (trg_PackagePriceAudit) with Audit Table & Test Cases

-- Create Audit Table if not exists
IF OBJECT_ID('package_audit', 'U') IS NULL
BEGIN
    CREATE TABLE package_audit (
        AuditID BIGINT IDENTITY(1,1) PRIMARY KEY,
        PackageID BIGINT NOT NULL,
        Event VARCHAR(50) NOT NULL,
        OldPrice DECIMAL(10,2),
        NewPrice DECIMAL(10,2),
        OldStatus VARCHAR(20),
        NewStatus VARCHAR(20),
        EventDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END;
GO

IF OBJECT_ID('trg_PackagePriceAudit', 'TR') IS NOT NULL
    DROP TRIGGER trg_PackagePriceAudit;
GO

CREATE TRIGGER trg_PackagePriceAudit
ON packages
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO package_audit
        (PackageID, Event, OldPrice, NewPrice, OldStatus, NewStatus, EventDate)
    SELECT
        i.id,
        'PACKAGE UPDATED',
        d.price,
        i.price,
        d.status,
        i.status,
        GETDATE()
    FROM deleted AS d
    INNER JOIN inserted AS i ON d.id = i.id
    WHERE ISNULL(d.price, -1) <> ISNULL(i.price, -1)
       OR ISNULL(d.status, '') <> ISNULL(i.status, '');
END;
GO

-- Test 1: Update price on Package 1 (Trigger MUST fire)
UPDATE packages
SET price = price + 500
WHERE id = 1;

SELECT * FROM package_audit ORDER BY AuditID DESC;

-- Test 2: Update description only (Trigger MUST NOT fire)
UPDATE packages
SET description = description + ' Updated details.'
WHERE id = 1;

SELECT * FROM package_audit ORDER BY AuditID DESC;

-- Test 3: Update price with same value (Trigger MUST NOT fire)
UPDATE packages
SET price = price
WHERE id = 1;

SELECT * FROM package_audit ORDER BY AuditID DESC;



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
