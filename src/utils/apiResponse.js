class ApiResponse {
  constructor(statusCode, message, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data; //Include data in the response
    this.success = statusCode >= 200 && statusCode < 300; // Set success to true for 2xx status codes, false otherwise
  }
}

export default ApiResponse;
