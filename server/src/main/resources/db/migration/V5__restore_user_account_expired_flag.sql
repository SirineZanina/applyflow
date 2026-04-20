-- Restore account-expiry flag used by User.isAccountNonExpired().
-- If V4 dropped the column, re-add it and initialize from credentials_expired.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_credential_expired BOOLEAN;

UPDATE users
SET is_credential_expired = COALESCE(is_credential_expired, credentials_expired, false);

ALTER TABLE users
    ALTER COLUMN is_credential_expired SET DEFAULT false,
    ALTER COLUMN is_credential_expired SET NOT NULL;
