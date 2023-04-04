const request = require('supertest');
const { app } = require('../../config/app');
const { createRating } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .delete('/api/ratings/some-id')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toBe(
      'You are not logged in! Please logged in to perform the action',
    );
  });

  it('should return error if user is not verified', async () => {
    const { cookie } = await signup({
      isVerified: false,
      email: 'test2@test.com',
    });

    const response = await request(app)
      .delete('/api/ratings/some-id')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});
// ===========================================

it('should delete rating', async () => {
  let rating = await createRating();
  const id = rating._id;
  expect(id).toBeDefined();

  await request(app)
    .delete(`/api/ratings/${id}`)
    .set('Cookie', cookie)
    .expect(200);
});

it('should return error if objectid is invalid', async () => {
  const id = 'invalid-object-id';
  const { body } = await request(app)
    .delete(`/api/ratings/${id}`)
    .set('Cookie', cookie)
    .expect(400);
  expect(body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid does not exist', async () => {
  const id = '00000020f51bb4362eee2a4d';
  const { body } = await request(app)
    .delete(`/api/ratings/${id}`)
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Cant not find rating with provided id');
});
