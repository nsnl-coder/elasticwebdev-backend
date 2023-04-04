const request = require('supertest');
const { app } = require('../../config/app');
const { createRating, validRatingData } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('shoud update the rating', async () => {
  const rating = await createRating();

  const { body } = await request(app)
    .put(`/api/ratings/${rating._id}`)
    .send(validRatingData)
    .set('Cookie', cookie)
    .expect(200);

  expect(body.data).toMatchObject(validRatingData);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/ratings/some-id')
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
      .put('/api/ratings/some-id')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});

// ===========================================

it('should return error if objectid is not valid', async () => {
  const { body } = await request(app)
    .put('/api/ratings/not-valid-objectid')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(400);

  expect(body.message).toEqual('Data validation failed');
  expect(body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid does not exist in db', async () => {
  const { body } = await request(app)
    .put('/api/ratings/00000020f51bb4362eee2a4d')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find rating with provided id');
});
