/*
================================================================================
HIKKING PROJECT - ADVANCED DATABASE OPERATIONS
GUIDE MANAGEMENT
Target DBMS : Microsoft SQL Server (T-SQL)
Member      : ______________________________
Tables      : users, guide_profiles, verification_documents, notifications, complaints
================================================================================
  Part           Object                                         Status
  1. View        vw_GuideVerificationSummary                    NEW
  2. Procedure   sp_VerifyGuide                                 NEW
  3. Trigger     trg_GuideVerifiedNotify                        NEW
  4. Transaction sp_ResolveComplaint                            NEW
================================================================================
*/


-- ================================================================
-- 1) VIEW: vw_GuideVerificationSummary
-- ================================================================

IF OBJECT_ID('vw_GuideVerificationSummary', 'V') IS NOT NULL
    DROP VIEW vw_GuideVerificationSummary;
GO

CREATE VIEW vw_GuideVerificationSummary
AS
SELECT
    gp.id                        AS GuideProfileID,
    u.name                       AS GuideName,
    u.email                      AS GuideEmail,
    gp.experience_years          AS ExperienceYears,
    gp.verification_status       AS ProfileStatus,
    ISNULL(vd.total_docs, 0)     AS TotalDocuments,
    ISNULL(vd.approved_docs, 0)  AS ApprovedDocuments,
    ISNULL(vd.rejected_docs, 0)  AS RejectedDocuments,
    ISNULL(cm.total_complaints, 0) AS TotalComplaints,
    ISNULL(cm.open_complaints, 0)  AS OpenComplaints,
    CASE
        WHEN ISNULL(vd.total_docs, 0) = 0     THEN 'No Documents'
        WHEN ISNULL(vd.rejected_docs, 0) > 0  THEN 'Has Rejected Documents'
        WHEN vd.approved_docs = vd.total_docs THEN 'Ready To Verify'
        ELSE 'Documents Pending'
    END AS VerificationReadiness
FROM guide_profiles AS gp
INNER JOIN users AS u ON u.id = gp.user_id
LEFT JOIN (
    SELECT guide_profile_id,
           COUNT(*) AS total_docs,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_docs,
           SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_docs
    FROM verification_documents
    GROUP BY guide_profile_id
) AS vd ON vd.guide_profile_id = gp.id
LEFT JOIN (
    SELECT p.guide_profile_id,
           COUNT(*) AS total_complaints,
           SUM(CASE WHEN c.status IN ('open', 'in_progress') THEN 1 ELSE 0 END) AS open_complaints
    FROM complaints AS c
    INNER JOIN bookings AS b ON b.booking_id = c.booking_id
    INNER JOIN packages AS p ON p.id = b.package_id
    GROUP BY p.guide_profile_id
) AS cm ON cm.guide_profile_id = gp.id;
GO

SELECT * FROM vw_GuideVerificationSummary ORDER BY GuideProfileID;


-- ================================================================
-- 2) STORED PROCEDURE: sp_VerifyGuide
-- ================================================================

IF OBJECT_ID('sp_VerifyGuide', 'P') IS NOT NULL
    DROP PROCEDURE sp_VerifyGuide;
GO

CREATE PROCEDURE sp_VerifyGuide
    @GuideProfileID BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID   BIGINT = NULL;
    DECLARE @Status   VARCHAR(20) = NULL;
    DECLARE @Total    INT = 0;
    DECLARE @Approved INT = 0;

    SELECT @UserID = user_id, @Status = verification_status
    FROM guide_profiles
    WHERE id = @GuideProfileID;

    IF @UserID IS NULL
    BEGIN
        SELECT 'NOT_FOUND' AS result, 'Guide profile not found.' AS message;
        RETURN;
    END;

    IF @Status = 'verified'
    BEGIN
        SELECT 'NO_CHANGE' AS result, 'Guide is already verified.' AS message;
        RETURN;
    END;

    SELECT @Total = COUNT(*),
           @Approved = ISNULL(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0)
    FROM verification_documents
    WHERE guide_profile_id = @GuideProfileID;

    IF @Total = 0
        SELECT 'REJECTED' AS result, 'No verification documents submitted.' AS message;
    ELSE IF @Approved < @Total
        SELECT 'REJECTED' AS result,
               CONCAT('Only ', @Approved, ' of ', @Total, ' documents approved.') AS message;
    ELSE
    BEGIN
        UPDATE guide_profiles
        SET verification_status = 'verified', updated_at = GETDATE()
        WHERE id = @GuideProfileID;

        SELECT 'VERIFIED' AS result,
               CONCAT('Guide profile #', @GuideProfileID, ' verified successfully.') AS message;
    END;
END;
GO

EXEC sp_VerifyGuide 999;  -- Not found
EXEC sp_VerifyGuide 1;    -- Already verified
EXEC sp_VerifyGuide 3;    -- Document nai -> REJECTED


-- ================================================================
-- 3) TRIGGER: trg_GuideVerifiedNotify (AFTER UPDATE ON guide_profiles)
-- ================================================================

IF OBJECT_ID('trg_GuideVerifiedNotify', 'TR') IS NOT NULL
    DROP TRIGGER trg_GuideVerifiedNotify;
GO

CREATE TRIGGER trg_GuideVerifiedNotify
ON guide_profiles
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO notifications
        (notification_id, user_id, type, message, is_read, created_at, updated_at)
    SELECT
        (SELECT ISNULL(MAX(notification_id), 0) FROM notifications)
            + ROW_NUMBER() OVER (ORDER BY i.id),
        i.user_id,
        'guide_verified',
        'Congratulations! Your guide profile has been verified.',
        0, GETDATE(), GETDATE()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id
    WHERE i.verification_status = 'verified'
      AND ISNULL(d.verification_status, '') <> 'verified';
END;
GO

-- Test 1: Guide 3-er approved document dao, tarpor verify koro (Trigger MUST fire)
INSERT INTO verification_documents
    (id, guide_profile_id, document_type, document_url, status, created_at, updated_at)
VALUES
    ((SELECT ISNULL(MAX(id), 0) + 1 FROM verification_documents),
     3, 'NID', 'nid_guide3.jpg', 'approved', GETDATE(), GETDATE());

EXEC sp_VerifyGuide 3;

SELECT TOP 3 * FROM notifications ORDER BY notification_id DESC;

-- Test 2: Onno column bodlale fire hobe na
UPDATE guide_profiles SET bio = ISNULL(bio, '') + ' ' WHERE id = 1;
SELECT TOP 3 * FROM notifications ORDER BY notification_id DESC;


-- ================================================================
-- 4) TRANSACTION: sp_ResolveComplaint (TRY/CATCH + THROW)
-- ================================================================

IF OBJECT_ID('sp_ResolveComplaint', 'P') IS NOT NULL
    DROP PROCEDURE sp_ResolveComplaint;
GO

CREATE PROCEDURE sp_ResolveComplaint
    @ComplaintID BIGINT,
    @NewStatus   VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;   -- error hole transaction auto-abort

    DECLARE @UserID  BIGINT = NULL;
    DECLARE @Current VARCHAR(20) = NULL;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @NewStatus NOT IN ('in_progress', 'resolved', 'rejected')
            THROW 50010, 'Invalid status. Use in_progress, resolved or rejected.', 1;

        -- UPDLOCK: onno session ekoi row ekshathe bodlate parbe na
        SELECT @UserID = user_id, @Current = status
        FROM complaints WITH (UPDLOCK)
        WHERE complaint_id = @ComplaintID;

        IF @UserID IS NULL
            THROW 50011, 'Complaint not found.', 1;
        IF @Current IN ('resolved', 'rejected')
            THROW 50012, 'Complaint is already closed.', 1;

        UPDATE complaints
        SET status = @NewStatus, updated_at = GETDATE()
        WHERE complaint_id = @ComplaintID;

        INSERT INTO notifications
            (notification_id, user_id, type, message, is_read, created_at, updated_at)
        VALUES
            ((SELECT ISNULL(MAX(notification_id), 0) + 1 FROM notifications),
             @UserID, 'complaint_update',
             CONCAT('Your complaint #', @ComplaintID, ' is now ', @NewStatus, '.'),
             0, GETDATE(), GETDATE());

        COMMIT TRANSACTION;

        SELECT 'OK' AS result,
               CONCAT('Complaint #', @ComplaintID, ' updated to ', @NewStatus, '.') AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 'FAILED' AS result,
               ERROR_NUMBER() AS error_code,
               ERROR_MESSAGE() AS error_message;
    END CATCH;
END;
GO

EXEC sp_ResolveComplaint 1, 'resolved';    -- OK
EXEC sp_ResolveComplaint 1, 'resolved';    -- FAILED: already closed
EXEC sp_ResolveComplaint 9999, 'resolved'; -- FAILED: not found
EXEC sp_ResolveComplaint 1, 'bogus';       -- FAILED: invalid status

SELECT * FROM complaints ORDER BY complaint_id;
SELECT TOP 3 * FROM notifications ORDER BY notification_id DESC;