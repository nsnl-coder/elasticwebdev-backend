const User = require('../models/userModel');
const createError = require('../utils/createError');
const jwt = require('jsonwebtoken');
const { sendVerifyEmail, sendResetPasswordEmail } = require('../utils/email');
const crypto = require('crypto');

// ============= COMMON CODE ====================

/**
 * This function accept user id as payload and return a jwt token
 */
const signJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * return a random token and hashed token of it using crypto library
 */
const createToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return { token, hashedToken };
};

/**
 * return hashed version of a given token using crypto library
 */
const getHashedToken = (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return hashedToken;
};

// ============= IMPLEMENTATION =============

const signUp = async (req, res, next) => {
  const { email, fullname, shippingAddress, password } = req.body;

  // check if email already exists
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return next(
      createError(400, 'An account with provided email already exists'),
    );
  }

  const { token, hashedToken } = createToken();

  // create new account
  const user = await User.create({
    email,
    password,
    fullname,
    shippingAddress,
    verifyToken: hashedToken,
    verifyTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    verifyEmailsSent: 1,
  });

  // send email verification email to user
  await sendVerifyEmail({
    to: user.email,
    payload: {
      verifyLink: `${process.env.FRONTEND_HOST}/auth/verify-email/${token}`,
      fullname: user.fullname,
    },
  });

  // send back jwt token as cookie
  const jwtToken = signJwtToken(user._id);

  res.cookie('jwt', jwtToken, {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // return cookie
  res.status(201).json({
    status: 'success',
    message: 'Check your email inbox to verify your email!',
    data: user,
  });
};

const verifyEmail = async (req, res, next) => {
  const verifyToken = req.params.token;
  const hashedVerifyToken = getHashedToken(verifyToken);

  const user = await User.findOne({
    verifyToken: hashedVerifyToken,
    verifyTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(createError(400, 'Token is invalid or has expired!'));
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    // data: user,
    message: 'Your email has been verified!',
  });
};

const resendVerifyEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // check if user exists
  if (!user) {
    res.status(404).json({
      status: 'fail',
      message: 'An account with provided email does not exist',
    });
    return;
  }

  // check if user is already verified
  if (user.isVerified) {
    res.status(200).json({
      status: 'success',
      message: 'You account has been verified!',
    });
    return;
  }

  // check if old token is still valid
  const duration = new Date(user.verifyTokenExpires) - new Date();
  const oldTokenIsValid = duration > 0;

  // if old token is still valid and 3 emails has been sent today, do not send email gain
  if (user.verifyEmailsSent === 3 && oldTokenIsValid) {
    return res.status(400).json({
      status: 'fail',
      message:
        'You have reached maxium number of emails resend today! Try again tommorrow!',
    });
  }

  // if old token is not valid, reset number of email sents
  // this is to avoid user spam resend email route
  if (!oldTokenIsValid) {
    user.verifyEmailsSent = 0;
  }

  // create new token and send it to user inbox
  const { token, hashedToken } = createToken();

  user.verifyToken = hashedToken;
  user.verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  user.verifyEmailsSent++;
  await user.save();

  // send email verification email to user
  await sendVerifyEmail({
    to: user.email,
    payload: {
      verifyLink: `${process.env.FRONTEND_HOST}/auth/verify-email/${token}`,
      fullname: user.fullname,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'An email has been sent to your inbox!',
  });
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  // check if an account with provided email exists
  const user = await User.findOne({ email });

  // check if correct password provided
  const isLoginValid = user && (await user.isLoginPasswordCorrect(password));

  if (!isLoginValid) {
    return next(createError(400, 'Invalid email or password'));
  }

  // return cookie
  res.cookie('jwt', signJwtToken(user._id), {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // return account info
  res.status(200).json({
    status: 'success',
    data: user,
  });
};

const signOut = (req, res, next) => {
  res.cookie('jwt', '');
  res.status(200).json({
    status: 'success',
    message: 'You successfully signed out',
  });
};

const getCurrentUser = (req, res, next) => {
  res.status(200).json({
    message: 'success',
    data: req.user,
  });
};

const updateEmail = async (req, res, next) => {
  const { email, password } = req.body;

  // check if provided password is correct
  const user = req.user;
  const isPasswordCorrect = await user.isLoginPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return next(createError(400, 'Password is incorrect'));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { email },
    { new: true },
  );
  res.status(200).json({
    status: 'succcess',
    data: updatedUser,
  });
};

/**
 * this route is for user still remember their password but want to change it
 */
const updatePassword = async (req, res, next) => {
  const { oldPassword, password } = req.body;

  // check if provided password is correct
  const user = req.user;
  const isPasswordCorrect = await user.isLoginPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    return next(createError(400, 'Password is incorrect'));
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    status: 'succcess',
    data: user,
  });
};

const updateUserInfo = async (req, res, next) => {
  const { email, password, fullname, shippingAddress, phone } = req.body;

  if (email) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please use /api/users/update-email route to update email',
    });
  }

  if (password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please use /api/users/update-password route to update password',
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      fullname,
      shippingAddress,
      phone,
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

/**
 * use this route if user forgot their password
 * send an email to user with a link. User can change their password from the link.
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  //
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'An user with this email does not exist',
    });
  }

  // send token to user
  const { token, hashedToken } = createToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min only
  await user.save();

  // send password reset email to user
  await sendResetPasswordEmail({
    to: user.email,
    payload: {
      resetLink: `${process.env.FRONTEND_HOST}/auth/reset-password/${token}`,
      fullname: user.fullname,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'We sent an email! Please check your inbox!',
  });
};

/**
 * user this route to reset password for those who forgot their password
 */
const resetPassword = async (req, res, next) => {
  const token = req.params.token;
  const { password } = req.body;
  const hashedToken = getHashedToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return res.status(200).json({
      status: 'fail',
      message: 'The token is invalid or expired!',
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'You successfully change your password!',
  });
};

const userController = {
  signUp,
  verifyEmail,
  resendVerifyEmail,
  signIn,
  signOut,
  updateEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateUserInfo,
  getCurrentUser,
  signJwtToken,
};

module.exports = userController;
