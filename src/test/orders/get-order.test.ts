import request from 'supertest';
import { app } from '../../config/app';
import { createOrder } from './utils';
import { signup } from '../setup';
import mongoose, { ObjectId } from 'mongoose';

let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({
    _id: '642b8200fc13ae1d48f4cf1e',
  });
  cookie = newCookie;
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .get('/api/orders/some-id')
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
      .get('/api/orders/some-id')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});

// ===================================================

it('returns 200 & successfully receives requested order', async () => {
  const order = await createOrder({
    createdBy: new mongoose.Types.ObjectId('642b8200fc13ae1d48f4cf1e'),
  });

  const response = await request(app)
    .get(`/api/orders/${order._id}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(response.body.data._id).toEqual(order._id);
});

it('returns 403 because the order is not belong to current user', async () => {
  const order = await createOrder({
    createdBy: new mongoose.Types.ObjectId('6446c100fc13ae03b4164cf0'),
  });

  const response = await request(app)
    .get(`/api/orders/${order._id}`)
    .set('Cookie', cookie)
    .expect(403);

  expect(response.body.message).toEqual(
    'You do not have permission to perform this action',
  );
});

it('should return error if objectid is not valid objectid', async () => {
  const response = await request(app)
    .get(`/api/orders/12345678900`)
    .set('Cookie', cookie)
    .expect(400);

  expect(response.body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid is not existed', async () => {
  const response = await request(app)
    .get(`/api/orders/507f1f77bcf86cd799439011`)
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual(
    'Can not find document with provided id params',
  );
});
