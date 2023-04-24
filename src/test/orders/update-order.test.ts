import request from 'supertest';
import { app } from '../../config/app';
import { createOrder, getValidOrderData } from './utils';
import { signup } from '../setup';
import mongoose from 'mongoose';
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('shoud update the order', async () => {
  const order = await createOrder({
    createdBy: new mongoose.Types.ObjectId('642b8200fc13ae1d48f4cf21'),
  });

  const newData = {
    fullname: 'new name',
    shippingAddress: 'new address',
    phone: '123456789',
    email: 'newemail@gmail.com',
    shippingStatus: 'processing',
    paymentStatus: 'paid',
    notes: 'new note',
  };

  const { body } = await request(app)
    .put(`/api/orders/${order._id}`)
    .send(newData)
    .set('Cookie', cookie)
    .expect(200);

  expect(body.data).toMatchObject(newData);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .put('/api/orders/some-id')
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
      .put('/api/orders/some-id')
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
      .put('/api/orders/some-id')
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
    .put('/api/orders/not-valid-objectid')
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
    .put('/api/orders/00000020f51bb4362eee2a4d')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find order with provided id');
});
