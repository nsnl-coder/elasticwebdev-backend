const request = require('supertest');
const { app } = require('../../config/app');
const { validFilesData } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('should create presign url if payload is valid', async () => {
  await request(app)
    .post('/api/files/presigned-url')
    .send(validFilesData)
    .set('Cookie', cookie)
    .expect(201);

  await request(app)
    .post('/api/files/presigned-url')
    .send({
      type: 'video/mp4',
      size: 49 * 1024 * 1024,
    })
    .set('Cookie', cookie)
    .expect(201);
});

it.each(['type', 'size'])('return error if %s is missing', async (field) => {
  const { body } = await request(app)
    .post('/api/files/presigned-url')
    .send({
      validFilesData,
      [field]: undefined,
    })
    .set('Cookie', cookie)
    .expect(400);

  // also check if it return correct message
  expect(body.errors).toContain(`${field} is required`);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .post('/api/files/presigned-url')
      .send(validFilesData)
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
      .post('/api/files/presigned-url')
      .send(validFilesData)
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
      .post('/api/files/presigned-url')
      .send(validFilesData)
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
