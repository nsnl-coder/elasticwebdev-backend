const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireLogin = async (req, res, next) => {
  const jwtToken = req.cookies.jwt;

  if (!jwtToken) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in! Please logged in to perform the action',
    });
  }

  const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant find an user belongs to provided token',
    });
  }

  if (user.passwordChangedAt) {
    const duration =
      new Date(decoded.iat * 1000) - new Date(user.passwordChangedAt);

    const isTokenExpired = duration < 0;
    if (isTokenExpired) {
      return res.status(400).json({
        status: 'fail',
        message: 'You recently changed password,please login again!',
      });
    }
  }

  if (!user.isVerified) {
    return res.status(401).json({
      status: 'fail',
      message: 'Please verified your email to complete this action!',
    });
  }

  req.user = user;
  next();
};

module.exports = requireLogin;
