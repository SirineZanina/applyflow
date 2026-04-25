CREATE TABLE IF NOT EXISTS generated_documents (
    id                  VARCHAR(255) NOT NULL,
    user_id             VARCHAR(255) NOT NULL,
    application_id      VARCHAR(255),
    type                VARCHAR(50)  NOT NULL,
    title               VARCHAR(255) NOT NULL,
    content             TEXT,
    storage_key         VARCHAR(255),
    mime_type           VARCHAR(255),
    size_bytes          BIGINT,
    created_date        TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    last_modified_date  TIMESTAMP(6) WITHOUT TIME ZONE,
    created_by          VARCHAR(255) NOT NULL,
    last_modified_by    VARCHAR(255),
    CONSTRAINT pk_generated_documents PRIMARY KEY (id),
    CONSTRAINT fk_generated_documents_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_generated_documents_application
        FOREIGN KEY (application_id) REFERENCES job_applications (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_generated_documents_user_id
    ON generated_documents (user_id);
