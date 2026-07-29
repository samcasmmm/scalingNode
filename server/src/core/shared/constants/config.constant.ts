export const APP = {
  NAME: 'Project To Be Used For Future Projects',
  VERSION: '1.0.0',
  DEFAULT_TIMEZONE: 'UTC',
  DEFAULT_LOCALE: 'en-IN',
  DEFAULT_CURRENCY: 'INR',
  SUPPORT_EMAIL: 'support@example.com',
};

export const AUTH = {
  TOKEN_PREFIX: 'Bearer',
  HEADER_KEY: 'authorization',
  REFRESH_COOKIE_NAME: 'refresh_token',
  RESET_TOKEN_EXPIRY_MINUTES: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_HISTORY_LIMIT: 5,
  SESSION_IDLE_TIMEOUT_MINUTES: 60,
  VERIFICATION_TOKEN_EXPIRY_HOURS: 24,
};

export const REGEX = {
  // Note: dot was previously unescaped (matched any character, not just '.')
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PHONE_INDIA: /^[6-9]\d{9}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  PINCODE_INDIA: /^[1-9]\d{5}$/,
  GSTIN: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z]{1}[A-Z\d]{1}$/,
  PAN_INDIA: /^[A-Z]{5}\d{4}[A-Z]$/,
  HEX_COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
  URL: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-./?%&=]*)?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NO_WHITESPACE: /^\S+$/,
};

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  ALLOWED_SPREADSHEET_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  MAX_FILES_PER_UPLOAD: 5,
  AVATAR_MAX_SIZE_MB: 2,
  UPLOAD_DIR: 'uploads',
  TEMP_DIR: 'uploads/tmp',
};