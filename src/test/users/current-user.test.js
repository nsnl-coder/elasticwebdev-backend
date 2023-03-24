const request = require('supertest');
const { app } = require('../../config/app');

it('returns 401 if user is not logged in', async () => {
  const response = await request(app)
    .get('/api/users/current-user')
    .expect(401);

  // expect correct message
  expect(response.body.message).toBe(
    'You are not logged in! Please logged in to perform the action',
  );
});

it('returns user data if user signed in', async () => {
  const cookie = await signup();

  const response = await request(app)
    .get('/api/users/current-user')
    .set('Cookie', cookie);
  // .expect(200);

  // expect correct message
  expect(response.body.data.email).toBe('test@test.com');
});
