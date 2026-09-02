/**
 * Typed CLI errors and process exit codes.
 *
 * Scripts and agents branch on the exit code instead of parsing stderr:
 *   0 success · 1 general · 2 auth · 3 rate-limit · 4 bad params · 5 network
 */
export const ExitCode = {
  OK: 0,
  GENERAL: 1,
  AUTH: 2,
  RATE_LIMIT: 3,
  BAD_PARAMS: 4,
  NETWORK: 5
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];

export class CliError extends Error {
  readonly exitCode: ExitCodeValue;
  constructor(message: string, exitCode: ExitCodeValue = ExitCode.GENERAL) {
    super(message);
    this.name = new.target.name;
    this.exitCode = exitCode;
  }
}

/** Not logged in, or the API rejected the session (401). A 403 is an ApiError: the
 * account is not permitted and logging in again will not change that. */
export class AuthError extends CliError {
  constructor(message: string) {
    super(message, ExitCode.AUTH);
  }
}

/** The API rate-limited the request (429). Safe to retry later. */
export class RateLimitError extends CliError {
  constructor(message: string) {
    super(message, ExitCode.RATE_LIMIT);
  }
}

/** Invalid arguments/flags, or a refused destructive command (missing --execute). */
export class UsageError extends CliError {
  constructor(message: string) {
    super(message, ExitCode.BAD_PARAMS);
  }
}

/** The request never reached the API (DNS, connection reset, timeout). */
export class NetworkError extends CliError {
  constructor(message: string) {
    super(message, ExitCode.NETWORK);
  }
}

/** The API answered with a non-auth, non-rate-limit error status. */
export class ApiError extends CliError {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message, status === 400 || status === 422 ? ExitCode.BAD_PARAMS : ExitCode.GENERAL);
    this.status = status;
  }
}

export function exitCodeForError(err: unknown): ExitCodeValue {
  return err instanceof CliError ? err.exitCode : ExitCode.GENERAL;
}
