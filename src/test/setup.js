const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../config/app');

let mongo;

// mock the email module
jest.mock('../utils/email.js');

const User = require('../models/userModel');
const { signJwtToken, createToken } = require('../controllers/userController');

// function that run before all of tests
beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.JWT_EXPIRES_IN = '90d';
  process.env.VERIFY_EMAIL_TOKEN_EXPIRES = 24;
  process.env.NODE_ENV = 'development';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

// function run before each test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// function that run after all of tests
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
    await mongoose.connection.close();
  }
});

//
afterEach(() => {
  jest.clearAllMocks();
});

global.jwt2Cookie = (jwt) => {
  return [`jwt=${jwt}; Path=/; HttpOnly`];
};

global.delay = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

global.signup = async (payload) => {
  const email = 'test@test.com';
  const password = 'password';
  const fullname = 'Test Name';

  // create verify token
  const { token, hashedToken } = createToken();
  // create an account

  let isVerified = true;
  if (payload?.isVerified === false) {
    isVerified = false;
  }

  const user = await User.create({
    email,
    password,
    fullname,
    isVerified,
    verifyToken: hashedToken,
    verifyTokenExpires:
      Date.now() + process.env.VERIFY_EMAIL_TOKEN_EXPIRES * 60 * 60 * 1000,
    verifyEmailsSent: 0,
  });

  // verify the account
  const jwt = signJwtToken(user._id);

  return {
    user,
    // this token is not hashed
    verifyToken: token,
    cookie: jwt2Cookie(jwt),
  };
};
