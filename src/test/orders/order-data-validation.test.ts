import request from 'supertest';
import { createOrder, getValidOrderData } from './utils';
import { app } from '../../config/app';
import { signup } from '../setup';
import mongoose from 'mongoose';

let cookie: string[] = [];
let validOrderData: any;

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
  validOrderData = await getValidOrderData();
});

let invalidData = [
  {
    field: 'email',
    email: 'test.com',
    message: 'email must be a valid email',
  },
  {
    field: 'phone',
    phone: 'wrong-phone',
    message: 'Please provide valid phone number',
  },
  {
    field: 'items',
    items: [],
    message: 'Your order need to have at least one item!',
  },
  {
    field: 'shippingAddress',
    shippingAddress: '123',
    message: 'Shipping address must be at least 6 characters',
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create order because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/orders`)
        .send({
          ...validOrderData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`should fail to update order because ${message}`, async () => {
      const order = await createOrder({
        createdBy: new mongoose.Types.ObjectId(),
      });
      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .send({
          ...validOrderData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`shoud fail to update many orders because ${message}`, async () => {
      let order1 = await createOrder({
        createdBy: new mongoose.Types.ObjectId(),
      });
      let order2 = await createOrder({
        createdBy: new mongoose.Types.ObjectId(),
      });

      const response = await request(app)
        .put('/api/orders')
        .set('Cookie', cookie)
        .send({
          updateList: [order1._id, order2._id],
          ...validOrderData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
