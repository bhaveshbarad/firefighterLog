/**
 * Application-wide tunable constants for the Nest API.
 */

/** bcrypt cost factor (salt rounds). Value 10 ⇒ 2^10 iterations. */
export const BCRYPT_ROUNDS = 10;

/** Access token lifetime passed to @nestjs/jwt `signOptions.expiresIn`. */
export const JWT_EXPIRES_IN = '7d' as const;

/** Default listen port when `PORT` is unset (see `main.ts`). */
export const DEFAULT_HTTP_PORT = 3000;

/** Default page size for `GET /call-logs`. */
export const CALL_LOG_DEFAULT_LIST_LIMIT = 50;

/** Maximum allowed `limit` query param for `GET /call-logs`. */
export const CALL_LOG_MAX_LIST_LIMIT = 200;

/** Maximum rows returned for `GET /call-logs/export` (CSV). */
export const CALL_LOG_EXPORT_ROW_CAP = 5000;
