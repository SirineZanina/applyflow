/**
 * Single source of truth for client-side validation rules.
 * MUST mirror server/src/main/java/com/sirine/applyflow/validation/ValidationConstants.java.
 * If you change a value here, change it there too.
 */

// Names
export const NAME_MIN = 2;
export const NAME_MAX = 50;
export const NAME_PATTERN = /^[\p{L} '-]+$/u;

// Password
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 100;
/** At least one lowercase, uppercase, digit, and non-word character. */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).*$/;

// Phone (E.164-ish)
export const PHONE_PATTERN = /^\+?[1-9]\d{8,13}$/;

// Resume / file labels
export const LABEL_MAX = 120;
export const LABEL_PATTERN = /^[\p{L}\p{N} ._-]{0,120}$/u;

// File upload (bytes) — must equal spring.servlet.multipart.max-file-size on the server.
export const FILE_MAX_BYTES = 5 * 1024 * 1024;

// Free-text fields
export const HEADLINE_MAX = 255;
export const COMPANY_NAME_MAX = 255;
export const JOB_TITLE_MAX = 255;
export const JOB_URL_MAX = 500;
export const NEXT_STEP_MAX = 255;
export const NOTES_MAX = 5000;
export const COVER_LETTER_MAX = 10_000;
export const DOCUMENT_TITLE_MAX = 255;
export const DOCUMENT_CONTENT_MAX = 100_000;

// Search / filter
export const SEARCH_QUERY_MAX = 200;

// Profile
export const YEARS_EXPERIENCE_MIN = 0;
export const YEARS_EXPERIENCE_MAX = 50;
export const CURRENCY_LEN = 3;

// Pagination
export const PAGE_SIZE_MAX = 100;
export const PAGE_SIZE_DEFAULT = 20;

// Match score (percent)
export const MATCH_PERCENT_MIN = 0;
export const MATCH_PERCENT_MAX = 100;

// Automation
export const AUTOMATION_LIMIT_MIN = 1;
export const AUTOMATION_LIMIT_MAX = 50;
export const AUTOMATION_JOB_IDS_MAX = 50;
export const ROLE_TYPES_MAX = 20;

// Accepted upload MIME types (must match the server whitelist).
export const RESUME_ACCEPTED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const RESUME_ACCEPTED_EXTENSIONS = ".pdf,.docx";
