const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongo;

const { User } = require('../models/userModel');
const { signJwtToken, createToken } = require('../controllers/authController');

// mock the email module
jest.mock('../utils/email.js');

// function that run before all of tests
beforeAll(async () => {
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
  // create verify token
  const { token, hashedToken } = createToken();

  // create an account
  const user = await User.create({
    email: 'test@test.com',
    password: 'password',
    fullname: 'test name',
    isVerified: true,
    verifyToken: hashedToken,
    verifyTokenExpires:
      Date.now() + process.env.VERIFY_EMAIL_TOKEN_EXPIRES * 60 * 60 * 1000,
    verifyEmailsSent: 0,
    ...payload,
  });

  // verify the account
  const jwt = signJwtToken(user._id);

  return {
    user,
    verifyToken: token,
    cookie: jwt2Cookie(jwt),
  };
};

global.deleteUser = async () => {
  await User.findOneAndDelete({ email: 'test@test.com' });
};
