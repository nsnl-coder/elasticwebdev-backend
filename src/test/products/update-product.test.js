const request = require('supertest');
const { app } = require('../../config/app');
const { createProduct, validProductData } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('shoud update the product', async () => {
  const product = await createProduct();
  expect(product.test_number).toEqual(10);

  const { body } = await request(app)
    .put(`/api/products/${product._id}`)
    .send(validProductData)
    .set('Cookie', cookie)
    .expect(200);

  // console.log(body);

  expect(body.data).toMatchObject(validProductData);
  expect(body.data.slug).toEqual('test-product-name');
});

it('shoud not update the product if collections ids do not exist', async () => {
  const product = await createProduct();

  const payload = {
    ...validProductData,
    collections: ['642b8200fc13ae1d48f4cf20', '642b8200fc13ae1d48f4cf21'],
  };

  const { body } = await request(app)
    .put(`/api/products/${product._id}`)
    .send(payload)
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find collections with provided ids');
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/products/some-id')
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
      .put('/api/products/some-id')
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
      .put('/api/products/some-id')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

it('should return error if objectid is not valid', async () => {
  const { body } = await request(app)
    .put('/api/products/not-valid-objectid')
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
    .put('/api/products/00000020f51bb4362eee2a4d')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find product with provided id');
});
