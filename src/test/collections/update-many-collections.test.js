const request = require('supertest');
const { app } = require('../../config/app');
const { createCollection } = require('./utils');

let cookie;

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/collections')
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
      .put('/api/collections')
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
      .put('/api/collections')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

describe('data validation', () => {
  it('should return error if pass string to isPinned', async () => {
    await request(app)
      .put('/api/collections')
      .send({
        isPinned: 'bad-data',
      })
      .set('Cookie', cookie)
      .expect(400);
  });
});

// =====================================================

it('returns 200 & successfully update the collections', async () => {
  const payload = {
    test_number: undefined,
    test_string: undefined,
    test_any: undefined,
  };

  let collection1 = await createCollection(payload);
  let collection2 = await createCollection(payload);

  // update collection
  const id1 = collection1._id;
  const id2 = collection2._id;

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  const response = await request(app)
    .put('/api/collections')
    .set('Cookie', cookie)
    .send({
      updateList: [id1, id2],
      isPinned: true,
    })
    .expect(200);

  expect(response.body.modifiedCount).toEqual(2);

  // double check
  collection1 = await request(app)
    .get(`/api/collections/${id1}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(collection1.body.data.isPinned).toEqual(true);
});

it('should return error if updateList contains invalid objectid', async () => {
  const response = await request(app)
    .put('/api/collections')
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
    .put('/api/collections')
    .send({
      updateList: ['507f191e810c19729de860ea', '00000020f51bb4362eee2a4d'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual(
    'Can not find collection with provided ids',
  );
});
