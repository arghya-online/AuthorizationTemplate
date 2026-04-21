class ApiError extends Error {
  constructor(
    statusCode,
    message = "An error occurred",
    errors = [],
    stack = "",
  ) {
    super(message); // Call the parent constructor with the message
    this.statusCode = statusCode;
    this.errors = errors; // You can add an errors property to hold any additional error details, such as validation errors, etc.
    this.data = null; // You can add a data property if you want to include additional information about the error. e.g., validation errors, etc.

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
//This entire code apiError.js is used to create a custom error class called ApiError that extends the built-in Error class in JavaScript. in other filer, middlewares, controllers, we can throw an instance of this ApiError class whenever we want to indicate that an error has occurred.
