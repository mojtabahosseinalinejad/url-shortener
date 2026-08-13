export const ERROR_CODES = {
  INVALID_URL: "INVALID_URL",
  DUPLICATE_CODE: "DUPLICATE_CODE",
  NOT_FOUND: "NOT_FOUND",
  EXPIRED: "EXPIRED",
  CLICK_LIMIT_REACHED: "CLICK_LIMIT_REACHED",
  PASSWORD_REQUIRED: "PASSWORD_REQUIRED",
  INVALID_PASSWORD: "INVALID_PASSWORD",
};

function createShortenerError(name, code, message, details = {}) {
  const err = new Error(message);
  err.name = name;
  err.code = code;
  err.details = details;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createShortenerError);
  }

  return err;
}

export const invalidUrlError = (url) =>
  createShortenerError(
    "InvalidUrlError",
    ERROR_CODES.INVALID_URL,
    `Invalid URL provided: "${url}". Only http:// and https:// are supported.`,
    { url },
  );

export const duplicateCodeError = (shortCode) =>
  createShortenerError(
    "DuplicateCodeError",
    ERROR_CODES.DUPLICATE_CODE,
    `Short code "${shortCode}" is already in use.`,
    { shortCode },
  );

export const shortLinkNotFoundError = (shortCode) =>
  createShortenerError(
    "ShortLinkNotFoundError",
    ERROR_CODES.NOT_FOUND,
    `No link found for short code "${shortCode}".`,
    { shortCode },
  );

export const expiredLinkError = (shortCode, expiresAt) =>
  createShortenerError(
    "ExpiredLinkError",
    ERROR_CODES.EXPIRED,
    `Link "${shortCode}" expired at ${new Date(expiresAt).toISOString()}.`,
    { shortCode, expiresAt },
  );

export const clickLimitReachedError = (shortCode, maxClicks) =>
  createShortenerError(
    "ClickLimitReachedError",
    ERROR_CODES.CLICK_LIMIT_REACHED,
    `Link "${shortCode}" reached its limit of ${maxClicks} clicks.`,
    { shortCode, maxClicks },
  );

export const passwordRequiredError = (shortCode) =>
  createShortenerError(
    "PasswordRequiredError",
    ERROR_CODES.PASSWORD_REQUIRED,
    `Link "${shortCode}" is password protected.`,
    { shortCode },
  );

export const invalidPasswordError = (shortCode) =>
  createShortenerError(
    "InvalidPasswordError",
    ERROR_CODES.INVALID_PASSWORD,
    `Incorrect password for link "${shortCode}".`,
    { shortCode },
  );
