const request = require('supertest');
const { app } = require('../../config/app');

it('returns 400 if email is missing', async () => {
  await signup();

  const { body } = await request(app)
    .post('/api/users/sign-in')
    .send({
      password: 'password',
    })
    .expect(400);

  // check if error message is correct
  expect(body.errors.includes('email is required')).toBe(true);
});

it('returns 400 if password is missing', async () => {
  await signup();

  const { body } = await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
    })
    .expect(400);

  // check if error message is correct
  expect(body.errors.includes('password is required')).toBe(true);
});

it('returns 400 if an account with provided email is not existed', async () => {
  const { body } = await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);

  // check if error message is correct
  expect(body.message).toBe('Invalid email or password');
});

it('returns 400 if password is not correct', async () => {
  await signup();

  const { body } = await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
      password: 'wrongpassword',
    })
    .expect(400);

  // check if error message is correct
  expect(body.message).toBe('Invalid email or password');
});

it('successfully signs in if email and password are correct', async () => {
  await signup();

  const response = await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);

  // check if user info is returned
  expect(response.body.data.email).toBe('test@test.com');

  // check if response includes cookie
  const cookie = response.get('Set-Cookie');
  expect(cookie).toBeDefined();
});
