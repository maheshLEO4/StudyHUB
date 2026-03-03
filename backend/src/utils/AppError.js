/**
 * Custom operational error class
 * Distinguishes expected errors (4xx) from unexpected bugs (5xx)
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;        // flag so error handler knows to send details
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
