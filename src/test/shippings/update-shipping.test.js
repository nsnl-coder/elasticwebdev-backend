const request = require('supertest');
const { app } = require('../../config/app');
const { createShipping, validShippingData } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('shoud update the shipping', async () => {
  const shipping = await createShipping();
  expect(shipping.test_number).toEqual(10);

  const { body } = await request(app)
    .put(`/api/shippings/${shipping._id}`)
    .send(validShippingData)
    .set('Cookie', cookie)
    .expect(200);

  expect(body.data).toMatchObject(validShippingData);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/shippings/some-id')
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
      .put('/api/shippings/some-id')
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
      .put('/api/shippings/some-id')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

// ===========================================

it('should return error if objectid is not valid', async () => {
  const { body } = await request(app)
    .put('/api/shippings/not-valid-objectid')
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
    .put('/api/shippings/00000020f51bb4362eee2a4d')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find shipping with provided id');
});
