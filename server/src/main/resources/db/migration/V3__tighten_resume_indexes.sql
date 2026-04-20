-- Tighten nullability gaps left in V2.

-- resume_documents.is_primary: primitive boolean on the entity writes false, but a hand-crafted
-- INSERT without the column would leave NULL, which Hibernate silently reads as false.
-- Backfill any existing NULLs before tightening, or the ALTER fails.
UPDATE resume_documents SET is_primary = false WHERE is_primary IS NULL;
ALTER TABLE resume_documents
    ALTER COLUMN is_primary SET NOT NULL,
    ALTER COLUMN is_primary SET DEFAULT false;

-- profile_desired_locations.location: NOT NULL consistent with profile_desired_roles.role.
-- Delete orphan NULL rows since an empty location entry carries no signal.
DELETE FROM profile_desired_locations WHERE location IS NULL;
ALTER TABLE profile_desired_locations
    ALTER COLUMN location SET NOT NULL;

-- Indexes for the queries issued on every list/lookup path.
-- resume_documents(user_id): covers findByUser_IdOrderByCreatedDateDesc + findByUser_IdAndPrimaryTrue.
CREATE INDEX IF NOT EXISTS idx_resume_documents_user_id
    ON resume_documents (user_id);

-- Partial index for the "which resume is primary?" query — small, always fast.
CREATE INDEX IF NOT EXISTS idx_resume_documents_user_primary
    ON resume_documents (user_id)
    WHERE is_primary;

-- resume_sections(resume_id): covers every section fetch; without this it's a full table scan.
CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id
    ON resume_sections (resume_id);
