const request = require('supertest');
const { app } = require('../../config/app');
const { sendVerifyEmail } = require('../../utils/email');

it('successfully signs up & send verification email', async () => {
  const response = await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password',
      fullname: 'Test Name',
    })
    .expect(201);

  // check if it returns cookie
  expect(response.get('Set-Cookie')).toBeDefined();

  // check if it returns new user info
  expect(response.body.data.email).toEqual('test@test.com');

  // check if the email has been sent
  expect(sendVerifyEmail).toHaveBeenCalled();
});

it('returns 400 if email is already in use', async () => {
  // sign up
  await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password',
      fullname: 'test name',
    })
    .expect(201);

  // sign up again with same email
  const { body } = await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password',
      fullname: 'Test Name',
    })
    .expect(400);

  // check if it returns correct error message
  expect(body.message).toBe('An account with provided email already exists');
});

it('returns 400 if email is missing ', async () => {
  const { body } = await request(app)
    .post('/api/users/sign-up')
    .send({
      password: 'password',
      fullname: 'Test Name',
    })
    .expect(400);

  // also check if it return correct message
  expect(body.errors.includes('email is required')).toBe(true);
});

it('returns 400 if password is missing ', async () => {
  const { body } = await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      fullname: 'Test Name',
    })
    .expect(400);

  // also check if it return correct message
  expect(body.errors.includes('password is required')).toBe(true);
});

it('returns 400 if email, and password are missing ', async () => {
  const { body } = await request(app)
    .post('/api/users/sign-up')
    .send({})
    .expect(400);

  // also check if it return correct error message
  const isValidErrors =
    body.errors.includes('email is required') &&
    body.errors.includes('password is required');

  expect(isValidErrors).toBe(true);
});

it('return 400 if email is not valid', async () => {
  const {
    body: { errors },
  } = await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'testtest.com',
      password: 'password',
      fullname: 'Test Name',
    })
    .expect(400);

  // also check if error message is correct
  expect(errors.includes('body.email must be a valid email')).toBe(true);
});

it('return 400 if password is shorter than 8 character', async () => {
  const {
    body: { errors },
  } = await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'passwo',
      fullname: 'Test Name',
    })
    .expect(400);

  // also check if error message is correct
  expect(errors.includes('body.password must be at least 8 characters')).toBe(
    true,
  );
});

it('return 400 if fullname is shorter than 6 characters', async () => {
  const {
    body: { errors },
  } = await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password',
      fullname: 'short',
    })
    .expect(400);

  // also check if error message is correct
  expect(errors.includes('body.fullname must be at least 6 characters')).toBe(
    true,
  );
});
