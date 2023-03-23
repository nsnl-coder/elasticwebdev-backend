const User = require('../models/userModel');
const createError = require('../utils/createError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new account
  const newUser = await User.create({
    email,
    password: hashedPassword,
    fullname,
    shippingAddress,
  });

  // send back jwt token as cookie
  const token = signToken(newUser._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // return account info
  res.status(201).json({
    status: 'success',
    data: newUser,
  });
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  // check if an account with provided email exists
  const user = await userModel.findOne({ email }).select('+password');

  const isLoginValid = user && (await user.isLoginPasswordCorrect(password));

  if (!isLoginValid) {
    return next(new AppError('Invalid email or password'));
  }

  resWithJwtToken(res, user, 200);
  // check if correct password provided
};

const updateEmail = (req, res, next) => {};

const updatePassword = (req, res, next) => {};

const updateUserInfo = (req, res, next) => {};

const deleteUser = (req, res, next) => {};

const userController = {
  signIn,
  signUp,
  updateEmail,
  updatePassword,
  updateUserInfo,
  deleteUser,
};

module.exports = userController;
