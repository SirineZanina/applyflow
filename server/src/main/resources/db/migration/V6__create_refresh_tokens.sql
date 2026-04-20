CREATE TABLE refresh_tokens (
    id                      VARCHAR(255)                    NOT NULL,
    user_id                 VARCHAR(255)                    NOT NULL,
    token_id                VARCHAR(255)                    NOT NULL,
    expires_at              TIMESTAMP(6) WITHOUT TIME ZONE  NOT NULL,
    revoked                 BOOLEAN                         NOT NULL DEFAULT false,
    revoked_at              TIMESTAMP(6) WITHOUT TIME ZONE,
    replaced_by_token_id    VARCHAR(255),
    created_by              VARCHAR(255)                    NOT NULL,
    created_date            TIMESTAMP(6) WITHOUT TIME ZONE  NOT NULL,
    last_modified_by        VARCHAR(255),
    last_modified_date      TIMESTAMP(6) WITHOUT TIME ZONE,
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT refresh_tokens_user_fk FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT refresh_tokens_token_id_unique UNIQUE (token_id)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
    ON refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked
    ON refresh_tokens (revoked);
