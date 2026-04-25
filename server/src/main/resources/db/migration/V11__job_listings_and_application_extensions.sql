CREATE TABLE IF NOT EXISTS job_listings (
    id                  VARCHAR(255) NOT NULL,
    company_name        VARCHAR(255) NOT NULL,
    company_logo_text   VARCHAR(40),
    company_color       VARCHAR(32),
    title               VARCHAR(255) NOT NULL,
    location            VARCHAR(255) NOT NULL,
    remote_eligible     BOOLEAN      NOT NULL DEFAULT FALSE,
    salary_min          INTEGER,
    salary_max          INTEGER,
    currency            VARCHAR(3),
    description         TEXT         NOT NULL,
    role_type           VARCHAR(255) NOT NULL,
    source_url          VARCHAR(500),
    posted_at           DATE         NOT NULL,
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date        TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    last_modified_date  TIMESTAMP(6) WITHOUT TIME ZONE,
    created_by          VARCHAR(255) NOT NULL,
    last_modified_by    VARCHAR(255),
    CONSTRAINT pk_job_listings PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS job_listing_required_skills (
    job_listing_id VARCHAR(255) NOT NULL,
    skill          VARCHAR(255) NOT NULL,
    CONSTRAINT fk_job_listing_required_skills
        FOREIGN KEY (job_listing_id) REFERENCES job_listings (id) ON DELETE CASCADE
);

ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS job_listing_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS match_score INTEGER,
    ADD COLUMN IF NOT EXISTS next_step VARCHAR(255),
    ADD COLUMN IF NOT EXISTS next_step_at TIMESTAMP(6) WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS ai_prepared BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_job_applications_job_listing'
          AND table_name = 'job_applications'
    ) THEN
        ALTER TABLE job_applications
            ADD CONSTRAINT fk_job_applications_job_listing
                FOREIGN KEY (job_listing_id) REFERENCES job_listings (id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_applications_user_job_listing
    ON job_applications (user_id, job_listing_id)
    WHERE job_listing_id IS NOT NULL;
