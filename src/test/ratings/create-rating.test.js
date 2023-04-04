const request = require('supertest');
const { app } = require('../../config/app');
const { createProduct } = require('../products/utils');
const { validRatingData } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup();
  cookie = newCookie;
});

it('returns 200 & successfully creates rating', async () => {
  const product = await createProduct();

  const { body } = await request(app)
    .post('/api/ratings')
    .set('Cookie', cookie)
    .send({
      ...validRatingData,
      product: product._id,
    })
    .expect(201);

  expect(body.data).toMatchObject(validRatingData);
});

it('should not create rating if product not exist', async () => {
  await request(app)
    .post('/api/ratings')
    .set('Cookie', cookie)
    .send({
      ...validRatingData,
      product: '642b8200fc13ae1d48f4cf1e',
    })
    .expect(404);
});

it.each(['stars', 'product', 'content'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/ratings')
      .send({
        // add payload here
        [field]: undefined,
      })
      .set('Cookie', cookie)
      .expect(400);

    // also check if it return correct message
    expect(body.errors.includes(`${field} is required`)).toBe(true);
  },
);

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .post('/api/ratings')
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
      .post('/api/ratings')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});
