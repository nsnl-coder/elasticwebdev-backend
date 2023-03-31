const request = require('supertest');
const { app } = require('../../config/app');
const { createCollection } = require('./utils');

let cookie;

beforeEach(() => {
  cookie = '';
});

describe.skip('auth check', () => {
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

describe.skip('data validation', () => {
  it('should return error if validation fail', async () => {
    const { body } = await request(app)
      .put('/api/collections')
      .send({})
      .set('Cookie', cookie)
      .expect(400);
  });
});

// =====================================================

it('returns 200 & successfully update the collections', async () => {
  let collection1 = await createCollection();
  let collection2 = await createCollection();

  expect(collection1.test_number).toEqual(10);
  expect(collection2.test_number).toEqual(10);

  // update collection
  const id1 = collection1._id;
  const id2 = collection2._id;

  const response = await request(app)
    .put('/api/collections')
    .set('Cookie', cookie)
    .send({
      updateList: [id1, id2],
      test_number: 24,
    })
    .expect(200);

  expect(response.body.modifiedCount).toEqual(2);

  // double check
  collection1 = await request(app)
    .get(`/api/collections/${id1}`)
    .set('Cookie', cookie)
    .expect(200);

  collection2 = await request(app)
    .get(`/api/collections/${id2}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(collection1.body.data.test_number).toEqual(24);
  expect(collection2.body.data.test_number).toEqual(24);
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

  expect(response.body.message).toEqual('Can not find collection with provided ids');
});
