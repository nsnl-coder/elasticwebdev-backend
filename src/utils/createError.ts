export interface CustomError extends Error {
  isCustomError?: boolean;
}

const createError = (message: string) => {
  const error: CustomError = new Error();
  error.message = message;
  error.isCustomError = true;
  return error;
};

export default createError;
