CREATE TABLE candidate_profiles (
    id                  VARCHAR(255)                    NOT NULL,
    user_id             VARCHAR(255)                    NOT NULL,
    headline            VARCHAR(255),
    summary             TEXT,
    years_experience    INTEGER,
    remote_preference   VARCHAR(50),
    salary_min          INTEGER,
    salary_max          INTEGER,
    currency            VARCHAR(3)                      DEFAULT 'EUR',
    created_by          VARCHAR(255)                    NOT NULL,
    created_date        TIMESTAMP(6) WITHOUT TIME ZONE  NOT NULL,
    last_modified_by    VARCHAR(255),
    last_modified_date  TIMESTAMP(6) WITHOUT TIME ZONE,
    CONSTRAINT candidate_profiles_pkey         PRIMARY KEY (id),
    CONSTRAINT candidate_profiles_user_fk      FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT candidate_profiles_user_unique  UNIQUE (user_id)
);

CREATE TABLE profile_desired_roles (
    profile_id  VARCHAR(255)  NOT NULL,
    role        VARCHAR(255)  NOT NULL,
    CONSTRAINT profile_desired_roles_fk  FOREIGN KEY (profile_id) REFERENCES candidate_profiles (id)
);

CREATE TABLE profile_desired_locations (
    profile_id  VARCHAR(255)  NOT NULL,
    location    VARCHAR(255),
    CONSTRAINT profile_desired_locations_fk  FOREIGN KEY (profile_id) REFERENCES candidate_profiles (id)
);

CREATE TABLE resume_documents (
    id                  VARCHAR(255)                    NOT NULL,
    user_id             VARCHAR(255)                    NOT NULL,
    label               VARCHAR(255),
    storage_key         VARCHAR(255)                    NOT NULL,
    mime_type           VARCHAR(255),
    size_bytes          BIGINT,
    parsed_at           TIMESTAMP(6) WITHOUT TIME ZONE,
    is_primary          BOOLEAN,
    created_by          VARCHAR(255)                    NOT NULL,
    created_date        TIMESTAMP(6) WITHOUT TIME ZONE  NOT NULL,
    last_modified_by    VARCHAR(255),
    last_modified_date  TIMESTAMP(6) WITHOUT TIME ZONE,
    CONSTRAINT resume_documents_pkey     PRIMARY KEY (id),
    CONSTRAINT resume_documents_user_fk  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE resume_sections (
    id                  VARCHAR(255)                    NOT NULL,
    resume_id           VARCHAR(255)                    NOT NULL,
    type                VARCHAR(50)                     NOT NULL,
    raw_json            JSONB,
    order_index         INTEGER,
    created_by          VARCHAR(255)                    NOT NULL,
    created_date        TIMESTAMP(6) WITHOUT TIME ZONE  NOT NULL,
    last_modified_by    VARCHAR(255),
    last_modified_date  TIMESTAMP(6) WITHOUT TIME ZONE,
    CONSTRAINT resume_sections_pkey       PRIMARY KEY (id),
    CONSTRAINT resume_sections_resume_fk  FOREIGN KEY (resume_id) REFERENCES resume_documents (id)
);
