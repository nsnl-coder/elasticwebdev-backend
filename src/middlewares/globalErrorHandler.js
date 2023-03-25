// handle required field missing && handle cast error
const handleRequiredFieldError = (error) => {
  const errorArr = error.message.split(',');

  errorArr.forEach((item, index) => {
    errorArr[index] = errorArr[index].trim();
  });

  return errorArr;
};

// handle unique field is duplicated
const handleDuplicationField = (error) => {
  const duplicateField = Object.keys(error.keyValue)[0];
  return `${duplicateField} already exists. Please choose another ${duplicateField}`;
};

const globalErrorHandler = (error, req, res, next) => {
  const statusCode = error.status || 400;
  if (process.env.NODE_ENV === 'development' && !error.isOperationalError) {
    res.status(400).json(error);
    return;
  }

  if (error.isOperationalError) {
    res.status(statusCode).json({ status: 'fail', message: error.message });
    return;
  }

  let formarttedError = 'Something wentwrong';

  if (error.name === 'ValidationError') {
    formarttedError = handleRequiredFieldError(error);
  }

  if (error.code === 11000) {
    formarttedError = handleDuplicationField(error);
  }

  if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError' ||
    error.name === 'CastError'
  ) {
    formarttedError = error.message;
  }

  if (formarttedError === 'Something wentwrong') {
    console.log(error);
  }

  res.status(statusCode).json({ status: 'fail', message: formarttedError });
};

module.exports = globalErrorHandler;
