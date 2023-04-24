import request from 'supertest';
import { app } from '../../config/app';
import { sendVerifyEmail } from '../../utils/email';

it('successfully signs up & send verification email', async () => {
  const response = await request(app)
    .post('/api/auth/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password',
      fullname: 'Test Name',
    })
    .expect(201);

  // check if it returns cookie
  expect(response.get('Set-Cookie')).toBeDefined();

  // check if it returns new user info
  // expect(response.body.data.email).toEqual('test@test.com');
  expect(response.body.data.fullname).toEqual('test name');

  // check if the email has been sent
  expect(sendVerifyEmail).toHaveBeenCalled();
});

it('returns 400 if email is already in use', async () => {
  // sign up
  await request(app)
    .post('/api/auth/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password',
      fullname: 'test name',
    })
    .expect(201);

  // sign up again with same email
  const { body } = await request(app)
    .post('/api/auth/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password',
      fullname: 'Test Name',
    })
    .expect(400);

  // check if it returns correct error message
  expect(body.message).toBe('An account with provided email already exists');
});

// check for required field
it.each([['email'], ['password']])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/auth/sign-up')
      .send({
        email: 'test@test.com',
        password: 'password',
        fullname: 'test name',
        [field]: undefined,
      })
      .expect(400);

    // also check if it return correct message
    expect(body.errors).toContain(`${field} is required`);
  },
);
