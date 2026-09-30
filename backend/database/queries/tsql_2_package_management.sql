/*
================================================================================
HIKKING PROJECT - ADVANCED DATABASE OPERATIONS
PACKAGE MANAGEMENT
Target DBMS : Microsoft SQL Server (T-SQL)
Member      : ______________________________
Tables      : destinations, packages, package_itineraries, categories, package_categories
================================================================================
  Part           Object                                         Status
  1. View        vw_DestinationPackageSummary                   NEW
  2. Procedure   sp_ReviewPackages                              existing
  3. Trigger     trg_PackagePriceAudit                          existing
  4. Transaction sp_CreatePackageWithItinerary                  NEW
================================================================================
*/


-- CREATE VIEW (vw_DestinationPackageSummary) with Aggregation & CASE Logic

IF OBJECT_ID('vw_DestinationPackageSummary', 'V') IS NOT NULL
    DROP VIEW vw_DestinationPackageSummary;
GO

CREATE VIEW vw_DestinationPackageSummary
AS
SELECT
    d.destination_id AS DestinationID,
    d.name           AS DestinationName,
    COUNT(p.id)      AS TotalPackages,
    ISNULL(SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END), 0) AS PublishedPackages,
    ISNULL(ROUND(AVG(p.price), 2), 0) AS AveragePrice,
    ISNULL(MIN(p.price), 0)           AS MinimumPrice,
    ISNULL(MAX(p.price), 0)           AS MaximumPrice,
    (SELECT COUNT(DISTINCT pc.category_id)
       FROM packages AS p2
       INNER JOIN package_categories AS pc ON pc.package_id = p2.id
      WHERE p2.destination_id = d.destination_id) AS CategoriesUsed,
    CASE
        WHEN COUNT(p.id) = 0       THEN 'No Packages'
        WHEN AVG(p.price) >= 15000 THEN 'Premium'
        WHEN AVG(p.price) >= 8000  THEN 'Standard'
        ELSE 'Budget'
    END AS PriceTier
FROM destinations AS d
LEFT JOIN packages AS p ON p.destination_id = d.destination_id
GROUP BY d.destination_id, d.name;
GO

-- Test View
SELECT * FROM vw_DestinationPackageSummary
ORDER BY AveragePrice DESC;

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


-- EXPLICIT TRANSACTION: sp_CreatePackageWithItinerary (SAVE TRANSACTION + TRY/CATCH)
--   * Validation/package/itinerary error -> full rollback
--   * Shudhu category link fail          -> package + itinerary thake (ROLLBACK TO savepoint)

IF OBJECT_ID('sp_CreatePackageWithItinerary', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreatePackageWithItinerary;
GO

CREATE PROCEDURE sp_CreatePackageWithItinerary
    @DestinationID   BIGINT,
    @GuideProfileID  BIGINT,
    @Title           VARCHAR(200),
    @Price           DECIMAL(10,2),
    @DurationDays    INT,
    @CategoryID      BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT OFF;   -- FK error-e transaction committable thake, savepoint rollback kaj kore

    DECLARE @PkgID BIGINT;
    DECLARE @Day   INT = 1;
    DECLARE @Step  VARCHAR(30) = 'INITIAL';

    BEGIN TRY
        BEGIN TRANSACTION;

        SET @Step = 'VALIDATE';
        IF @Price <= 0
            THROW 50001, 'Price must be greater than zero.', 1;
        IF @DurationDays < 1 OR @DurationDays > 30
            THROW 50002, 'Duration must be between 1 and 30 days.', 1;

        -- Step 1: Package
        SET @Step = 'PACKAGE';
        SET @PkgID = (SELECT ISNULL(MAX(id), 0) + 1 FROM packages);

        INSERT INTO packages
            (id, destination_id, guide_profile_id, title, duration_days, duration_nights,
             price, status, created_at, updated_at)
        VALUES
            (@PkgID, @DestinationID, @GuideProfileID, @Title, @DurationDays,
             CASE WHEN @DurationDays > 1 THEN @DurationDays - 1 ELSE 0 END,
             @Price, 'draft', GETDATE(), GETDATE());

        -- Step 2: Itinerary (prottek din)
        SET @Step = 'ITINERARY';
        WHILE @Day <= @DurationDays
        BEGIN
            INSERT INTO package_itineraries
                (id, package_id, day_number, title, created_at, updated_at)
            VALUES
                ((SELECT ISNULL(MAX(id), 0) + 1 FROM package_itineraries),
                 @PkgID, @Day, 'Day ' + CAST(@Day AS VARCHAR(3)), GETDATE(), GETDATE());
            SET @Day = @Day + 1;
        END;

        SAVE TRANSACTION AfterItinerary;

        -- Step 3: Category link
        SET @Step = 'CATEGORY';
        INSERT INTO package_categories (package_id, category_id)
        VALUES (@PkgID, @CategoryID);

        COMMIT TRANSACTION;

        SELECT 'OK' AS result, @PkgID AS package_id,
               'Package created with itinerary and category.' AS message;
    END TRY
    BEGIN CATCH
        IF @Step = 'CATEGORY' AND XACT_STATE() = 1
        BEGIN
            ROLLBACK TRANSACTION AfterItinerary;
            COMMIT TRANSACTION;
            SELECT 'PARTIAL_SUCCESS' AS result, @PkgID AS package_id,
                   'Package and itinerary saved; category link failed.' AS message,
                   ERROR_NUMBER() AS error_code, ERROR_MESSAGE() AS error_message;
        END
        ELSE
        BEGIN
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT 'FAILED' AS result, CAST(NULL AS BIGINT) AS package_id,
                   'Transaction completely aborted.' AS message,
                   ERROR_NUMBER() AS error_code, ERROR_MESSAGE() AS error_message;
        END;
    END CATCH;
END;
GO

-- Test 1: Shob thik
EXEC sp_CreatePackageWithItinerary 1, 1, 'Test Sajek Weekend Trek', 9500.00, 3, 1;

-- Test 2: Category 9999 nai -> PARTIAL_SUCCESS
EXEC sp_CreatePackageWithItinerary 1, 1, 'Test Package No Category', 8000.00, 2, 9999;

-- Test 3: Negative price -> FAILED
EXEC sp_CreatePackageWithItinerary 1, 1, 'Test Bad Price', -500.00, 2, 1;

SELECT TOP 3 id, title, price, status FROM packages ORDER BY id DESC;