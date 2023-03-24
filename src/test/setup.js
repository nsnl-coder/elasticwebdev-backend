const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../config/app');

let mongo;

// mock the email module
jest.mock('../utils/email.js');

const User = require('../models/userModel');
const { signJwtToken } = require('../controllers/userController');

// function that run before all of tests
beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.JWT_EXPIRES_IN = '90d';

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
global.signup = async () => {
  const email = 'test@test.com';
  const password = 'password';
  const fullname = 'Test Name';

  // create an account
  const user = await User.create({
    email,
    password,
    fullname,
    isVerified: true,
  });

  // verify the account

  const cookie = signJwtToken(user._id);

  return [`jwt=${cookie}; Path=/; HttpOnly`];
};
