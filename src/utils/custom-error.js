class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createError = (message, statusCode) => {
  const error = new CustomError(message, statusCode);
  return error;
};

module.exports = createError;
