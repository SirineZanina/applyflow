package com.sirine.applyflow.validation;

/**
 * Single source of truth for validation rules.
 * Mirrored on the client at client/src/lib/validation/constants.ts — keep in sync.
 */
public final class ValidationConstants {

    private ValidationConstants() {}

    // Names
    public static final int NAME_MIN = 2;
    public static final int NAME_MAX = 50;
    public static final String NAME_PATTERN = "^[\\p{L} '-]+$";

    // Password
    public static final int PASSWORD_MIN = 8;
    public static final int PASSWORD_MAX = 100;
    /** At least one lowercase, uppercase, digit, and non-word character. */
    public static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).*$";

    // Phone (E.164-ish)
    public static final String PHONE_PATTERN = "^\\+?[1-9]\\d{8,13}$";

    // Resume / file labels
    public static final int LABEL_MAX = 120;
    public static final String LABEL_PATTERN = "^[\\p{L}\\p{N} ._\\-]{0,120}$";

    // File upload (bytes) — must equal spring.servlet.multipart.max-file-size in application.yml
    public static final long FILE_MAX_BYTES = 5L * 1024 * 1024;

    // Free-text fields
    public static final int HEADLINE_MAX = 255;
    public static final int COMPANY_NAME_MAX = 255;
    public static final int JOB_TITLE_MAX = 255;
    public static final int JOB_URL_MAX = 500;
    public static final int NEXT_STEP_MAX = 255;
    public static final int NOTES_MAX = 5000;
    public static final int COVER_LETTER_MAX = 10_000;
    public static final int DOCUMENT_TITLE_MAX = 255;
    public static final int DOCUMENT_CONTENT_MAX = 100_000;

    // Search / filter
    public static final int SEARCH_QUERY_MAX = 200;

    // Profile
    public static final int YEARS_EXPERIENCE_MIN = 0;
    public static final int YEARS_EXPERIENCE_MAX = 50;
    public static final int CURRENCY_LEN = 3;

    // Pagination
    public static final int PAGE_SIZE_MAX = 100;
    public static final int PAGE_SIZE_DEFAULT = 20;

    // Match score (percent)
    public static final int MATCH_PERCENT_MIN = 0;
    public static final int MATCH_PERCENT_MAX = 100;

    // Automation
    public static final int AUTOMATION_LIMIT_MIN = 1;
    public static final int AUTOMATION_LIMIT_MAX = 50;
    public static final int AUTOMATION_JOB_IDS_MAX = 50;
    public static final int ROLE_TYPES_MAX = 20;
}
