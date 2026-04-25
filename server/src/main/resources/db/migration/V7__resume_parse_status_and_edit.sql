ALTER TABLE resume_documents
    ADD COLUMN IF NOT EXISTS parse_status VARCHAR(20),
    ADD COLUMN IF NOT EXISTS parse_error TEXT;

UPDATE resume_documents
SET parse_status = CASE
                       WHEN parsed_at IS NULL THEN 'PENDING'
                       ELSE 'SUCCESS'
    END
WHERE parse_status IS NULL;

ALTER TABLE resume_documents
    ALTER COLUMN parse_status SET NOT NULL,
    ALTER COLUMN parse_status SET DEFAULT 'PENDING';