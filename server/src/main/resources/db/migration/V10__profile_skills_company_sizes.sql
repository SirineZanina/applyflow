CREATE TABLE IF NOT EXISTS profile_skills (
    profile_id VARCHAR(255) NOT NULL,
    skill      VARCHAR(255) NOT NULL,
    CONSTRAINT profile_skills_fk
        FOREIGN KEY (profile_id) REFERENCES candidate_profiles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_company_sizes (
    profile_id    VARCHAR(255) NOT NULL,
    company_size  VARCHAR(255) NOT NULL,
    CONSTRAINT profile_company_sizes_fk
        FOREIGN KEY (profile_id) REFERENCES candidate_profiles (id) ON DELETE CASCADE
);
