import request from 'supertest';
import { app } from '../../config/app';
import { signup } from '../setup';
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('returns 200 & successfully creates collection', async () => {
  const { body } = await request(app)
    .post('/api/collections')
    .set('Cookie', cookie)
    .send({
      name: 'Some great name',
      photo: 'https://',
      isPinned: true,
    })
    .expect(201);

  expect(body.data.name).toBe('Some great name');
  expect(body.data.photo).toBe('https://');
  expect(body.data.isPinned).toBe(true);
  expect(body.data.slug).toBe('some-great-name');
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .post('/api/collections')
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
      .post('/api/collections')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });

  it('should return error if user is not admin', async () => {
    const { cookie } = await signup({
      email: 'test2@test.com',
      role: 'user',
    });

    const { body } = await request(app)
      .post('/api/collections')
      .set('Cookie', cookie)
      .expect(403);

    expect(body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
