-- Enforce one primary resume per user at DB level.
-- If old data has multiple primaries, keep newest one and demote rest.
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id
               ORDER BY created_date DESC, id DESC
           ) AS rank
    FROM resume_documents
    WHERE is_primary = true
)
UPDATE resume_documents r
SET is_primary = false
FROM ranked ranked_resumes
WHERE r.id = ranked_resumes.id
  AND ranked_resumes.rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_resume_documents_user_primary
    ON resume_documents (user_id)
    WHERE is_primary = true;
