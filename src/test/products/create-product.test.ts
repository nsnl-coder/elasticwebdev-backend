import request from 'supertest';
import { app } from '../../config/app';
import { validProductData } from './utils';
import { createCollection } from '../collections/utils';
import { signup } from '../setup';
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('returns 200 & successfully creates product', async () => {
  const collection1 = await createCollection();
  const collection2 = await createCollection();

  const payload = {
    ...validProductData,
    collections: [collection1._id, collection2._id],
  };

  const { body } = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send(payload)
    .expect(201);

  expect(body.data).toMatchObject(payload);
  expect(body.data.slug).toEqual('test-product-name');
});

it('returns 200 & successfully creates product', async () => {
  const payload = {
    ...validProductData,
    collections: ['642b8200fc13ae1d48f4cf20', '642b8200fc13ae1d48f4cf21'],
  };

  const { body } = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send(payload)
    .expect(404);

  expect(body.message).toEqual('Can not find collections with provided ids');
});

it('fail to create product if collections contain non-existent collection id', async () => {
  const { body } = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      ...validProductData,
      collections: ['507f1f77bcf86cd799439011'],
    })
    .expect(404);

  expect(body.message).toEqual('Can not find collections with provided ids');
});

it('should create product with existent collection ids', async () => {
  const collection1 = await createCollection();
  const collection2 = await createCollection();

  const { body } = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      ...validProductData,
      collections: [collection1._id, collection2._id],
    })
    .expect(201);

  expect(body.data).toMatchObject({
    ...validProductData,
    collections: [collection1._id, collection2._id],
  });
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .post('/api/products')
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
      .post('/api/products')
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
      .post('/api/products')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
