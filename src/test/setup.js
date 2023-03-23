const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../config/app');

let mongo;

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

  const response = await request(app)
    .post('/api/users/sign-up')
    .send({
      email,
      password,
      fullname,
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');
  return cookie;
};
