class ApiResponse {
  // Standard signature: (statusCode, data, message)
  constructor(statusCode, data = null, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // success is true for status codes < 400
  }
}

export { ApiResponse };
