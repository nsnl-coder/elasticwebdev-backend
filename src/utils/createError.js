const createError = (statusCode, message) => {
  const error = new Error();
  error.status = statusCode;
  error.message = message;
  error.isOperationalError = true;
  return error;
};

module.exports = createError;
