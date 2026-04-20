-- Remove duplicate user credential-expiry column.
-- The canonical field is users.credentials_expired (mapped by User.credentialsExpired).
ALTER TABLE users
    DROP COLUMN IF EXISTS is_credential_expired;
