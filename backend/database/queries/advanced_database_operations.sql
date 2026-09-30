/*
================================================================================
HIKKING PROJECT - ADVANCED DATABASE OPERATIONS
================================================================================
Topic: Advanced Database Operations (View, Procedures, Trigger, Transaction)
System: HikKing - Hiking & Trekking Tour Management System
Target DBMS: MySQL 8.4 (Laragon / HeidiSQL / Workbench / CLI)
================================================================================
Contents:
  --Q1:  Table Creation with PK, FK, UNIQUE & CHECK Constraints + Test Operations
  --Q2:  Multi-Table JOIN with Sorting
  --Q3:  GROUP BY with HAVING Clause & Aggregate Functions
  --Q4:  Scalar Subquery with Comparison
  --Q5:  Correlated Subquery with NOT EXISTS (Universal Quantification)
  --Q6:  CREATE VIEW (OutstandingBookings) with Aggregation & CASE Logic
  --Q7:  STORED PROCEDURE (sp_TravelerBookingStatus) with Parameters, IF/ELSE & CASE
  --Q8:  STORED PROCEDURE (sp_ReviewPackages) with WHILE Loop & Conditional Updates
  --Q9:  AFTER UPDATE TRIGGER (trg_PackagePriceAudit) with Audit Table & Test Cases
  --Q10: EXPLICIT TRANSACTION with SAVEPOINT, Handlers & Partial Rollback
================================================================================
*/

USE `hikking`;

-- ================================================================================
-- --Q1: Table Creation with PK, FK, UNIQUE, CHECK Constraints & Test Data
-- ================================================================================

DROP TABLE IF EXISTS `Reservations`;

CREATE TABLE `Reservations` (
    `ResID` INT NOT NULL AUTO_INCREMENT,
    `TravelerID` BIGINT UNSIGNED NOT NULL,
    `PackageID` BIGINT UNSIGNED NOT NULL,
    `ResDate` DATE NOT NULL DEFAULT (CURRENT_DATE),
    `TotalTravelers` INT NOT NULL DEFAULT 1,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    PRIMARY KEY (`ResID`),
    CONSTRAINT `FK_Reservations_Users`
        FOREIGN KEY (`TravelerID`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Reservations_Packages`
        FOREIGN KEY (`PackageID`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
    CONSTRAINT `UQ_Reservations_TravelerPackageDate`
        UNIQUE (`TravelerID`, `PackageID`, `ResDate`),
    CONSTRAINT `CK_Reservations_Travelers`
        CHECK (`TotalTravelers` >= 1 AND `TotalTravelers` <= 20),
    CONSTRAINT `CK_Reservations_Status`
        CHECK (`Status` IN ('Pending', 'Confirmed', 'Collected', 'Cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Valid Reservation 1
INSERT INTO `Reservations` (`TravelerID`, `PackageID`, `TotalTravelers`, `Status`)
VALUES (5, 1, 2, 'Pending');

-- Verify Insertion
SELECT * FROM `Reservations`
WHERE `ResID` = 1;

-- Insert Valid Reservation 2 (different package)
INSERT INTO `Reservations` (`TravelerID`, `PackageID`, `TotalTravelers`, `Status`)
VALUES (5, 2, 1, 'Confirmed');

-- Insert Valid Reservation 3 (different traveler, same package)
INSERT INTO `Reservations` (`TravelerID`, `PackageID`, `TotalTravelers`, `Status`)
VALUES (6, 1, 3, 'Pending');

-- Display All Reservations
SELECT * FROM `Reservations`;


-- ================================================================================
-- --Q2: Multi-Table JOIN with Sorting
-- ================================================================================

SELECT
    u.name AS TravelerName,
    p.title AS PackageTitle,
    d.name AS DestinationName,
    g.name AS GuideName,
    b.travel_date AS TravelDate,
    b.total_travelers AS TotalTravelers,
    b.total_price AS TotalPrice,
    b.booking_status AS BookingStatus
FROM `users` AS u
INNER JOIN `bookings` AS b ON u.id = b.traveler_id
INNER JOIN `packages` AS p ON b.package_id = p.id
INNER JOIN `destinations` AS d ON p.destination_id = d.destination_id
LEFT JOIN `guide_profiles` AS gp ON p.guide_profile_id = gp.id
LEFT JOIN `users` AS g ON gp.user_id = g.id
ORDER BY
    u.name ASC,
    b.travel_date DESC;


-- ================================================================================
-- --Q3: GROUP BY with HAVING Clause & Aggregate Functions
-- ================================================================================

SELECT
    d.name AS DestinationName,
    COUNT(p.id) AS NumberOfPackages,
    AVG(p.price) AS AveragePrice,
    MIN(p.price) AS MinimumPrice,
    MAX(p.price) AS MaximumPrice
FROM `destinations` AS d
INNER JOIN `packages` AS p ON d.destination_id = p.destination_id
GROUP BY
    d.destination_id,
    d.name
HAVING
    AVG(p.price) > 8000
ORDER BY
    AveragePrice DESC;


-- ================================================================================
-- --Q4: Scalar Subquery with Comparison
-- ================================================================================

SELECT
    id AS PackageID,
    title AS PackageTitle,
    price AS Price,
    duration_days AS DurationDays
FROM `packages`
WHERE price >
(
    SELECT AVG(price) FROM `packages`
)
ORDER BY
    price DESC;


-- ================================================================================
-- --Q5: Correlated Subquery with NOT EXISTS (Universal Quantification)
-- Find travelers who have booked ALL packages under destination 'Cox''s Bazar'
-- ================================================================================

SELECT
    u.id AS TravelerID,
    u.name AS TravelerName,
    u.email AS TravelerEmail
FROM `users` AS u
WHERE u.role = 'traveler'
AND NOT EXISTS
(
    SELECT 1 FROM `packages` AS p
    INNER JOIN `destinations` AS d ON p.destination_id = d.destination_id
    WHERE d.name = 'Cox\'s Bazar'
    AND NOT EXISTS
    (
        SELECT 1 FROM `bookings` AS b
        WHERE b.traveler_id = u.id AND b.package_id = p.id
    )
);


-- ================================================================================
-- --Q6: CREATE VIEW (OutstandingBookings) with Aggregation & CASE Logic
-- ================================================================================

DROP VIEW IF EXISTS `OutstandingBookings`;

CREATE VIEW `OutstandingBookings` AS
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
FROM `bookings` AS b
INNER JOIN `users` AS u ON b.traveler_id = u.id
INNER JOIN `packages` AS p ON b.package_id = p.id
INNER JOIN `destinations` AS d ON p.destination_id = d.destination_id
LEFT JOIN `payments` AS pay ON b.booking_id = pay.booking_id
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

-- Test View Query
SELECT * FROM `OutstandingBookings`
ORDER BY TravelDate;


-- ================================================================================
-- --Q7: STORED PROCEDURE (sp_TravelerBookingStatus) with Parameters, IF/ELSE & CASE
-- ================================================================================

DROP PROCEDURE IF EXISTS `sp_TravelerBookingStatus`;

DELIMITER //

CREATE PROCEDURE `sp_TravelerBookingStatus`(IN p_traveler_id INT)
BEGIN
    DECLARE v_name          VARCHAR(150) DEFAULT NULL;
    DECLARE v_booking_count INT DEFAULT 0;
    DECLARE v_total_spend   DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_unpaid        DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_status        VARCHAR(20) DEFAULT 'Clear';

    -- Continue handler prevents 1329 error when SELECT INTO finds no rows
    DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN END;

    -- 1. Fetch traveler name
    SELECT name INTO v_name
    FROM `users`
    WHERE id = p_traveler_id;

    -- Edge case: Traveler does not exist
    IF v_name IS NULL THEN
        SELECT 'Traveler not found' AS result,
               NULL AS Name,
               NULL AS BookingCount,
               NULL AS TotalSpend,
               NULL AS UnpaidAmount,
               NULL AS Status;
    ELSE
        -- 2. Count bookings
        SELECT COUNT(*) INTO v_booking_count
        FROM `bookings`
        WHERE traveler_id = p_traveler_id;

        -- Edge case: Traveler exists but has no bookings
        IF v_booking_count = 0 THEN
            SELECT CONCAT(v_name, ' has no booking record') AS result,
                   v_name  AS Name,
                   0       AS BookingCount,
                   0.00    AS TotalSpend,
                   0.00    AS UnpaidAmount,
                   'Clear' AS Status;
        ELSE
            -- 3. Calculate total spend
            SELECT COALESCE(SUM(total_price), 0) INTO v_total_spend
            FROM `bookings`
            WHERE traveler_id = p_traveler_id;

            -- 4. Calculate unpaid balance
            SELECT COALESCE(SUM(
                       CASE
                           WHEN pay.payment_status IN ('pending', 'failed')
                           THEN pay.amount
                           ELSE 0
                       END
                   ), 0)
            INTO v_unpaid
            FROM `bookings` AS b
            LEFT JOIN `payments` AS pay ON pay.booking_id = b.booking_id
            WHERE b.traveler_id = p_traveler_id;

            -- 5. Business logic categorization
            SET v_status =
                CASE
                    WHEN v_unpaid >= 10000 THEN 'Blocked'
                    WHEN v_unpaid >= 3000  THEN 'Warning'
                    ELSE 'Clear'
                END;

            -- Output record
            SELECT 'OK'            AS result,
                   v_name          AS Name,
                   v_booking_count AS BookingCount,
                   v_total_spend   AS TotalSpend,
                   v_unpaid        AS UnpaidAmount,
                   v_status        AS Status;
        END IF;
    END IF;
END //

DELIMITER ;

-- Test Cases for sp_TravelerBookingStatus
CALL sp_TravelerBookingStatus(5); -- Aiman Ahmed (Clear, 3 bookings)
CALL sp_TravelerBookingStatus(7); -- Nusrat Jahan (Blocked: unpaid >= 10000)
CALL sp_TravelerBookingStatus(6); -- Tanvir Rahman (Clear)
CALL sp_TravelerBookingStatus(1); -- Admin/No bookings
CALL sp_TravelerBookingStatus(999); -- Non-existent user


-- ================================================================================
-- --Q8: STORED PROCEDURE (sp_ReviewPackages) with WHILE Loop & Conditional Updates
-- ================================================================================

DROP PROCEDURE IF EXISTS `sp_ReviewPackages`;

DELIMITER //

CREATE PROCEDURE `sp_ReviewPackages`()
BEGIN
    DECLARE v_pkg_id      INT DEFAULT 1;
    DECLARE v_max_id      INT DEFAULT 0;
    DECLARE v_title       VARCHAR(200);
    DECLARE v_price       DECIMAL(10,2);
    DECLARE v_booking_cnt INT;
    DECLARE v_action      VARCHAR(50);

    -- Handler to safely bypass gaps in package primary keys
    DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN END;

    SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM `packages`;

    WHILE v_pkg_id <= v_max_id DO
        SET v_title = NULL;

        SELECT title, price
        INTO v_title, v_price
        FROM `packages`
        WHERE id = v_pkg_id;

        IF v_title IS NOT NULL THEN
            SELECT COUNT(*) INTO v_booking_cnt
            FROM `bookings`
            WHERE package_id = v_pkg_id;

            -- High demand: promote to published
            IF v_booking_cnt >= 3 THEN
                UPDATE `packages`
                SET status = 'published'
                WHERE id = v_pkg_id;

                SET v_action = 'promoted';
            -- Zero demand: apply 10% discount
            ELSEIF v_booking_cnt = 0 THEN
                UPDATE `packages`
                SET price = ROUND(price * 0.90, 2)
                WHERE id = v_pkg_id;

                SET v_action = 'discounted';
            ELSE
                SET v_action = 'no action';
            END IF;

            SELECT CONCAT(
                       v_title,
                       ' | bookings=', v_booking_cnt,
                       ' | ', v_action
                   ) AS log_line;
        END IF;

        SET v_pkg_id = v_pkg_id + 1;
    END WHILE;
END //

DELIMITER ;

-- Execute Review Packages Procedure
CALL sp_ReviewPackages();

-- Verify Updated Packages
SELECT id, title, price, status
FROM `packages`
ORDER BY id;


-- ================================================================================
-- --Q9: AFTER UPDATE TRIGGER (trg_PackagePriceAudit) with Audit Table & Test Cases
-- ================================================================================

CREATE TABLE IF NOT EXISTS `package_audit` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` BIGINT UNSIGNED NOT NULL,
    `event` VARCHAR(50) NOT NULL,
    `old_price` DECIMAL(10,2) NULL,
    `new_price` DECIMAL(10,2) NULL,
    `old_status` VARCHAR(20) NULL,
    `new_status` VARCHAR(20) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_package_id` (`package_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `trg_package_price_audit`;

DELIMITER //

CREATE TRIGGER `trg_package_price_audit`
AFTER UPDATE ON `packages`
FOR EACH ROW
BEGIN
    -- Uses null-safe comparison <=> to catch changes accurately
    IF NOT (OLD.price <=> NEW.price) OR NOT (OLD.status <=> NEW.status) THEN
        INSERT INTO `package_audit`
            (package_id, event, old_price, new_price, old_status, new_status, created_at)
        VALUES
            (NEW.id, 'PACKAGE UPDATED', OLD.price, NEW.price, OLD.status, NEW.status, NOW());
    END IF;
END //

DELIMITER ;

-- Test 1: Update price on Package 1 (Trigger MUST fire)
UPDATE `packages`
SET price = price + 500
WHERE id = 1;

SELECT * FROM `package_audit` ORDER BY id DESC LIMIT 5;

-- Test 2: Update description only (Trigger MUST NOT fire)
UPDATE `packages`
SET description = CONCAT(description, ' Updated details.')
WHERE id = 1;

SELECT * FROM `package_audit` ORDER BY id DESC LIMIT 5;

-- Test 3: Update price with identical value (Trigger MUST NOT fire)
UPDATE `packages`
SET price = price
WHERE id = 1;

SELECT * FROM `package_audit` ORDER BY id DESC LIMIT 5;


-- ================================================================================
-- --Q10: EXPLICIT TRANSACTION with SAVEPOINT, Handlers & Partial Rollback
-- ================================================================================

DROP PROCEDURE IF EXISTS `sp_CreateBookingWithPayment`;

DELIMITER //

CREATE PROCEDURE `sp_CreateBookingWithPayment`(
    IN p_traveler_id INT,
    IN p_package_id  INT,
    IN p_travel_date DATE,
    IN p_travelers   INT,
    IN p_amount      DECIMAL(10,2)
)
BEGIN
    DECLARE v_booking_id INT DEFAULT NULL;
    DECLARE v_error      INT DEFAULT 0;
    DECLARE v_msg        TEXT DEFAULT '';
    DECLARE v_step       VARCHAR(50) DEFAULT 'INITIAL';

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error = MYSQL_ERRNO,
            v_msg   = MESSAGE_TEXT;

        -- If payment fails, rollback to savepoint preserving the booking
        IF v_step = 'PAYMENT_FAILED' THEN
            ROLLBACK TO SAVEPOINT after_booking;
            COMMIT;
            SELECT 'PARTIAL_SUCCESS' AS result,
                   v_booking_id AS booking_id,
                   'Booking preserved as pending; payment failed.' AS message,
                   v_error AS error_code,
                   v_msg AS error_message;
        ELSE
            ROLLBACK;
            SELECT 'FAILED' AS result,
                   NULL AS booking_id,
                   'Transaction completely aborted.' AS message,
                   v_error AS error_code,
                   v_msg AS error_message;
        END IF;
    END;

    START TRANSACTION;

        -- Step 1: Create booking
        SET v_step = 'BOOKING';
        INSERT INTO `bookings`
            (traveler_id, package_id, travel_date, total_travelers,
             total_price, booking_status, created_at, updated_at)
        VALUES
            (p_traveler_id, p_package_id, p_travel_date, p_travelers,
             p_amount, 'pending', NOW(), NOW());

        SET v_booking_id = LAST_INSERT_ID();

        -- Savepoint established after booking succeeds
        SAVEPOINT after_booking;

        -- Step 2: Create payment
        SET v_step = 'PAYMENT_FAILED';
        INSERT INTO `payments`
            (booking_id, transaction_id, amount, payment_status, created_at, updated_at)
        VALUES
            (v_booking_id, CONCAT('TXN-', UUID()), p_amount, 'paid', NOW(), NOW());

        -- Step 3: Update booking status to confirmed
        UPDATE `bookings`
        SET booking_status = 'confirmed', updated_at = NOW()
        WHERE booking_id = v_booking_id;

        SET v_step = 'COMPLETED';

    COMMIT;

    SELECT 'OK' AS result,
           v_booking_id AS booking_id,
           CONCAT('Booking #', v_booking_id, ' created and confirmed successfully.') AS message,
           0 AS error_code,
           '' AS error_message;
END //

DELIMITER ;

-- Test Transaction Execution
CALL sp_CreateBookingWithPayment(5, 2, '2026-12-25', 2, 29000.00);

-- Verify Resulting Booking and Payment
SELECT * FROM `bookings` ORDER BY booking_id DESC LIMIT 1;
SELECT * FROM `payments` ORDER BY payment_id DESC LIMIT 1;
