const request = require('supertest');
const { app } = require('../../config/app');
const { createProduct, validProductData } = require('../products/utils');
const { validOrderData } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it.only('returns 200 & successfully creates order', async () => {
  const product = await createProduct(validProductData);

  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      items: [
        {
          product: product._id,
          options: [
            product.variants[0].options[0]._id,
            product.variants[1].options[0]._id,
          ],
        },
      ],
    });
  // .expect(201);

  // expect(body.data).toMatchObject(validOrderData);
});

it.skip.each(['email', 'password'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/orders')
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
      .post('/api/orders')
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
      .post('/api/orders')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });

  it('should return error if user is not admin', async () => {
    const { cookie } = await signup({
      email: 'test2@test.com',
    });

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
