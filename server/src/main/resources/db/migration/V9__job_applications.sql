CREATE TABLE job_applications (
    id                  VARCHAR(255)    NOT NULL,
    user_id             VARCHAR(255)    NOT NULL,
    resume_id           VARCHAR(255),
    company_name       VARCHAR(255)    NOT NULL,
    job_title          VARCHAR(255)    NOT NULL,
    job_url            VARCHAR(500),
    status             VARCHAR(20)     NOT NULL DEFAULT 'SAVED',
    applied_at         DATE,
    notes              TEXT,
    cover_letter       TEXT,
    created_date       TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    last_modified_date TIMESTAMP(6) WITHOUT TIME ZONE,
    created_by         VARCHAR(255)    NOT NULL,
    last_modified_by   VARCHAR(255),
    CONSTRAINT pk_job_applications PRIMARY KEY (id),
    CONSTRAINT fk_job_applications_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_job_applications_resume FOREIGN KEY (resume_id) REFERENCES resume_documents(id) ON DELETE SET NULL
);

CREATE INDEX idx_job_applications_user_id ON job_applications (user_id);
CREATE INDEX idx_job_applications_status ON job_applications (status);

COMMENT ON COLUMN job_applications.status IS 'SAVED,APPLIED,INTERVIEWING,OFFER,REJECTED,WITHDRAWN';
