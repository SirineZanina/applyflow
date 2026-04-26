ALTER TABLE job_listings
    ADD COLUMN IF NOT EXISTS external_source VARCHAR(50),
    ADD COLUMN IF NOT EXISTS external_id    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS external_url   VARCHAR(500);

-- Seeded rows are internal, not from any external provider.
UPDATE job_listings
SET external_source = 'internal'
WHERE external_source IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_listings_external
    ON job_listings (external_source, external_id)
    WHERE external_id IS NOT NULL;
