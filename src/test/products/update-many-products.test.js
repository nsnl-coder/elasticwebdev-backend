const request = require('supertest');
const { app } = require('../../config/app');
const { createProduct } = require('./utils');

let cookie = '';

beforeEach(async () => {
  // const { cookie: newCookie } = await signup({ role: 'admin' });
  // cookie = newCookie;
});

it('returns 200 & successfully update the products', async () => {
  let product1 = await createProduct();
  let product2 = await createProduct();

  // update product
  const id1 = product1._id;
  const id2 = product2._id;

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  const response = await request(app)
    .put('/api/products')
    .set('Cookie', cookie)
    .send({
      updateList: [id1, id2],
      test_number: 24,
    })
    .expect(200);

  expect(response.body.modifiedCount).toEqual(2);

  // double check
  product1 = await request(app)
    .get(`/api/products/${id1}`)
    .set('Cookie', cookie)
    .expect(200);

  product2 = await request(app)
    .get(`/api/products/${id2}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(product1.body.data.test_number).toEqual(24);
  expect(product2.body.data.test_number).toEqual(24);
});

describe.skip('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/products')
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
      .put('/api/products')
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
      .put('/api/products')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

// =====================================================

it('should return error if updateList contains invalid objectid', async () => {
  const response = await request(app)
    .put('/api/products')
    .send({
      updateList: ['id-not-valid', 'invalid-id'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(400);

  expect(response.body.message).toEqual('Data validation failed');
  expect(response.body.errors).toContain('Invalid ObjectId');
});

it('should return error if updateList contains non-existent objectid', async () => {
  const response = await request(app)
    .put('/api/products')
    .send({
      updateList: ['507f191e810c19729de860ea', '00000020f51bb4362eee2a4d'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual('Can not find product with provided ids');
});
