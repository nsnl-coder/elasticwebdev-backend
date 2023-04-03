const request = require('supertest');
const { app } = require('../../config/app');
const { validCouponData } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it.only('returns 200 & successfully creates coupon', async () => {
  const { body } = await request(app)
    .post('/api/coupons')
    .set('Cookie', cookie)
    .send({
      ...validCouponData,
      couponCode: 'test-code',
    })
    .expect(201);

  console.log(body);

  expect(body.data).toMatchObject(validCouponData);
  expect(body.data.couponCode).toEqual('test-code');
  expect(body.data.isExpired).toEqual(false);
  expect(body.data.updatedAt).toBeUndefined();
});

it('returns 200 if try to create 2 coupons with samecode', async () => {
  await request(app)
    .post('/api/coupons')
    .set('Cookie', cookie)
    .send({
      ...validCouponData,
      couponCode: 'test-code',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/coupons')
    .set('Cookie', cookie)
    .send({
      ...validCouponData,
      couponCode: 'test-code',
    })
    .expect(400);

  expect(response.body.message).toEqual(
    'couponCode already exists. Please choose another couponCode',
  );
});

it('returns 200 & successfully creates coupon without startDate & endDate', async () => {
  await request(app)
    .post('/api/coupons')
    .set('Cookie', cookie)
    .send({
      ...validCouponData,
      couponCode: 'test-code',
      startDate: undefined,
      endDate: undefined,
    })
    .expect(201);
});

it.each(['couponCode', 'discountUnit', 'discountAmount', 'couponQuantity'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/coupons')
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
      .post('/api/coupons')
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
      .post('/api/coupons')
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
      .post('/api/coupons')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
