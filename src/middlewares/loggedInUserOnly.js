const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const createError = require('../utils/createError');

const loggedInUserOnly = async (req, res, next) => {
  const jwtToken = req.cookies.jwt;

  if (!jwtToken) {
    return next(
      createError(
        401,
        'You are not logged in! Please logged in to perform the action',
      ),
    );
  }

  const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      createError(404, 'Cant find an user belongs to provided token'),
    );
  }

  if (user.passwordChangedAt) {
    const duration =
      new Date(decoded.iat * 1000) - new Date(user.passwordChangedAt);

    const isTokenExpired = duration < 0;
    if (isTokenExpired)
      return next(
        createError(400, 'You recently changed password,please login again!'),
      );
  }

  if (!user.isVerified) {
    return next(
      createError(401, 'Please verified your email to complete this action!'),
    );
  }

  req.user = user;
  next();
};

module.exports = loggedInUserOnly;
