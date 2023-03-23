const User = require('../models/userModel');
const createError = require('../utils/createError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signOut = (req, res, next) => {
  res.cookie('jwt', '');
  res.status(200).json({
    status: 'success',
    message: 'You successfully signed out',
  });
};

const signUp = async (req, res, next) => {
  const { email, fullname, shippingAddress, password } = req.body;

  // check if email already exists
  const user = await User.findOne({ email });

  if (user) {
    return next(
      createError(400, 'An account with provided email already exists'),
    );
  }

  // create new account
  const newUser = await User.create({
    email,
    password,
    fullname,
    shippingAddress,
  });

  // send back jwt token as cookie
  const token = signToken(newUser._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // return cookie
  res.status(201).json({
    status: 'success',
    data: newUser,
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
  res.cookie('jwt', signToken(user._id), {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // return account info
  res.status(200).json({
    status: 'success',
    data: user,
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

const userController = {
  signIn,
  signUp,
  signOut,
  updateEmail,
  updatePassword,
  updateUserInfo,
  getCurrentUser,
};

module.exports = userController;
