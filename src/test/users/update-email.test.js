const request = require('supertest');
const { app } = require('../../config/app');

it('returns 401 if user is not logged in', async () => {
  const response = await request(app)
    .put('/api/users/update-email')
    .send({
      email: 'test2@test.com',
      password: 'password',
    })
    .expect(401);

  // expect correct message
  expect(response.body.message).toBe(
    'You are not logged in! Please logged in to perform the action',
  );
});

it('returns 400 if provided password is incorrect', async () => {
  const cookie = await signup();

  const response = await request(app)
    .put('/api/users/update-email')
    .set('Cookie', cookie)
    .send({
      email: 'test2@test.com',
      password: 'passwordincorrect',
    });
  // .expect(400);

  // expect correct message
  expect(response.body.message).toBe('Password is incorrect');
});

it('return 400 if new email is not a valid email', async () => {
  const cookie = await signup();

  const response = await request(app)
    .put('/api/users/update-email')
    .set('Cookie', cookie)
    .send({
      email: 'test2test.com',
      password: 'password',
    })
    .expect(400);

  // expect correct message
  expect(
    response.body.errors.includes('body.email must be a valid email'),
  ).toBe(true);
});

it('return 200 if successfully update email', async () => {
  const cookie = await signup();

  const response = await request(app)
    .put('/api/users/update-email')
    .set('Cookie', cookie)
    .send({
      email: 'test2@test.com',
      password: 'password',
    })
    .expect(200);

  // return new user with new email
  expect(response.body.data.email).toBe('test2@test.com');

  // try to log in with new email
  await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test2@test.com',
      password: 'password',
    })
    .expect(200);

  // make sure it failed to log in with old email
  await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});
