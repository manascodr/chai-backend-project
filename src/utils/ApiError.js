class ApiError extends Error {
  constructor( // Standard signature: (statusCode, message, errors, stack)
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // Call the parent constructor with the message
    this.statusCode = statusCode;
    this.data = null; // ApiError does not carry data
    this.message = message;
    this.errors = errors;
    this.stack = stack;
    this.success = false; // since it's an error, success is always false

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
