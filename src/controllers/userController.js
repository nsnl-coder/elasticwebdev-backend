const User = require('../models/userModel');
const createError = require('../utils/createError');
const bcrypt = require('bcrypt');

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

  // return account info
  res.status(201).json({
    status: 'success',
    data: newUser,
  });
};

const signIn = (req, res, next) => {
  res.send('test res');
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
