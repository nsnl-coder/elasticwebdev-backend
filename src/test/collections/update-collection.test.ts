import request from 'supertest';
import { app } from '../../config/app';
import { createCollection, validCollectionData } from './utils';
import { signup } from '../setup';

let cookie: string[];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('shoud update the collection', async () => {
  const collection = await createCollection();
  expect(collection.test_number).toEqual(10);

  const { body } = await request(app)
    .put(`/api/collections/${collection._id}`)
    .send(validCollectionData)
    .set('Cookie', cookie)
    .expect(200);

  expect(body.data).toMatchObject(validCollectionData);
  expect(body.data.slug).toEqual('test-collection-name');
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .put('/api/collections/some-id')
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
      .put('/api/collections/some-id')
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
      .put('/api/collections/some-id')
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
    .put('/api/collections/not-valid-objectid')
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
    .put('/api/collections/00000020f51bb4362eee2a4d')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find collection with provided id');
});
