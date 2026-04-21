// This helper wraps async Express route handlers.
// If the route throws an error, it forwards that error to `next()`.
// That keeps try-catch blocks out of every controller.
//It can be written in different ways but this is the most common way to write it.

const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default asyncHandler;
