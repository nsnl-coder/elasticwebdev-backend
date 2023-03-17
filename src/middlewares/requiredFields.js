const createError = require('../utils/createError');

const requiredFields =
  (...fields) =>
  (req, res, next) => {
    const errors = [];

    fields.forEach((field) => {
      if (!req.body[field]) errors.push(`${field} is required`);
    });

    if (errors.length > 0) {
      res.status(400).json({
        status: 'fail',
        message: 'missing required field',
        errors,
      });
      return;
    }

    next();
  };

module.exports = requiredFields;
