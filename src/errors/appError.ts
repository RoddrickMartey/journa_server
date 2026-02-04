/**
 * Custom application error class.
 *
 * Used to represent operational (expected) errors such as:
 * - Authentication failures
 * - Authorization failures
 * - Validation errors
 *
 * These errors are safe to expose to the client.
 */
export class AppError extends Error {
  /**
   * HTTP status code associated with the error.
   */
  public statusCode: number;

  /**
   * Indicates whether the error is operational (expected)
   * or a programming/system error.
   */
  public isOperational: boolean;

  /**
   * Indicates whether the client should be logged out.
   * Typically used for authentication-related errors.
   */
  public logout?: boolean;

  /**
   * Creates a new application error.
   *
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param options - Optional error metadata
   * @param options.logout - Whether the client should be logged out
   */
  constructor(
    message: string,
    statusCode = 500,
    options?: { logout?: boolean },
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.logout = options?.logout;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace excluding constructor
    Error.captureStackTrace(this);
  }
}
