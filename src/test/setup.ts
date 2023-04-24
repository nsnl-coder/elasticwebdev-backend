import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
//
import { User } from '../models/userModel';
import { signJwtToken, createToken } from '../controllers/authController';
import { IUser } from '../yup/userSchema';

// mock the email module
jest.mock('../utils/email.ts');

let mongo: any;
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

const jwt2Cookie = (jwt: string) => [`jwt=${jwt}; Path=/; HttpOnly`];

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const signup = async (payload?: Partial<IUser>) => {
  // create verify token
  const { token, hashedToken } = createToken();

  const user = await User.create({
    email: 'test@test.com',
    password: 'password',
    fullname: 'test name',
    isVerified: true,
    verifyToken: hashedToken,
    verifyTokenExpires:
      Date.now() +
      Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRES) * 60 * 60 * 1000,
    verifyEmailsSent: 0,
    ...payload,
  });

  const jwt = signJwtToken(user._id);

  return {
    user,
    verifyToken: token,
    cookie: [`jwt=${jwt}; Path=/; HttpOnly`],
  };
};

const deleteUser = async () => {
  await User.findOneAndDelete({ email: 'test@test.com' });
};

export { jwt2Cookie, delay, signup, deleteUser };
