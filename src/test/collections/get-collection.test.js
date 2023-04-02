const request = require('supertest');
const { app } = require('../../config/app');
const { createCollection } = require('./utils');

let cookie;

beforeEach(() => {
  cookie = '';
});

// ===================================================

it('returns 200 & successfully receives requested collection', async () => {
  const collection = await createCollection();
  const response = await request(app)
    .get(`/api/collections/${collection._id}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(response.body.data._id).toEqual(collection._id);
});

it('should return error if objectid is not valid objectid', async () => {
  const response = await request(app)
    .get(`/api/collections/12345678900`)
    .set('Cookie', cookie)
    .expect(400);

  expect(response.body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid is not existed', async () => {
  const response = await request(app)
    .get(`/api/collections/507f1f77bcf86cd799439011`)
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual(
    'Can not find collection with provided id',
  );
});
