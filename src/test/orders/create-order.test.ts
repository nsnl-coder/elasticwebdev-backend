import request from 'supertest';
import { app } from '../../config/app';
import { signup } from '../setup';
import { getValidOrderData } from './utils';
import { IOrder } from '../../yup/orderSchema';

let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'user' });
  cookie = newCookie;
});

it('returns 200 & successfully creates order', async () => {
  const validOrderData = await getValidOrderData();

  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      ...validOrderData,
    })
    .expect(201);

  const order: IOrder = body.data.order;

  expect(order.subTotal).toEqual(164);
  expect(order.grandTotal).toEqual(169);

  // check varaints first item
  expect(order.items![0].variants![0].variantName).toEqual('size');
  expect(order.items![0].variants![0].optionName).toEqual('xs');
  expect(order.items![0].variants![1].variantName).toEqual('color');
  expect(order.items![0].variants![1].optionName).toEqual('red');

  // check variant second items
  expect(order.items![1].variants![0].variantName).toEqual('size');
  expect(order.items![1].variants![0].optionName).toEqual('sm');
  expect(order.items![1].variants![1].variantName).toEqual('color');
  expect(order.items![1].variants![1].optionName).toEqual('green');

  // check shippings
  expect(order.shipping.fees).toEqual(25);
  expect(order.shipping.name).toEqual('Express shipping');

  // check discounts
  expect(order.discount.couponCode).toEqual('TEST_COUPON');
  expect(order.discount.inDollar).toEqual(20);
  expect(order.discount.inPercent).toEqual(12.2);
});

it.each(['items', 'fullname', 'shippingAddress', 'email', 'phone'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/orders')
      .send({
        // add payload here
        [field]: undefined,
      })
      .set('Cookie', cookie)
      .expect(400);

    // also check if it return correct message
    expect(body.errors.includes(`${field} is required`)).toBe(true);
  },
);

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .post('/api/orders')
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
      .post('/api/orders')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});
