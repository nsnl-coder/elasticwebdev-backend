const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const createError = require('../utils/createError');

const loggedInUserOnly = async (req, res, next) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    return next(
      createError(
        401,
        'You are not logged in! Please logged in to perform the action',
      ),
    );
  }

  const jwtToken = bearerToken.split(' ')[1];

  const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!user) {
    return next(
      createError(404, 'Cant find an user belongs to provided token'),
    );
  }

  if (user.passwordChangedAt) {
    const duration = new Date(decoded.iat) - new Date(user.passwordChangedAt);
    const isTokenExpired = duration < 0;
    if (isTokenExpired)
      return next(
        createError(404, 'You recently changed password,please login again!'),
      );
  }

  req.user = user;
  next();
};

module.exports = loggedInUserOnly;
