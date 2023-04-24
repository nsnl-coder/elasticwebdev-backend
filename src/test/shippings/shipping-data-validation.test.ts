import request from 'supertest';
import { createShipping, validShippingData } from './utils';
import { app } from '../../config/app';
import { signup } from '../setup';

let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'display_name',
    message: 'name must be at most 255 characters',
    display_name: 's'.repeat(256),
  },
  {
    field: 'delivery_min',
    message: 'Delivery min duration must be greater than or equal to 0',
    delivery_min: -100,
  },
  {
    field: 'delivery_min',
    message: 'Delivery min duration must be less than or equal to 9999',
    delivery_min: 10000,
  },
  {
    field: 'delivery_max',
    message: 'delivery max duration must be greater than or equal to 0',
    delivery_max: -100,
  },
  {
    field: 'delivery_max',
    message: 'delivery max duration must be less than or equal to 999',
    delivery_max: 10000,
  },
  {
    field: 'delivery_min_unit + delivery_max_unit',
    message: 'Delivery max unit should have higher time unit.',
    delivery_min_unit: 'day',
    delivery_max_unit: 'hour',
  },
  {
    field: 'delivery_min_unit + delivery_max_unit',
    message: 'Delivery max unit should have higher time unit.',
    delivery_min_unit: 'business_day',
    delivery_max_unit: 'day',
  },
  {
    field: 'delivery_min + delivery_max',
    message: 'Delivery max time should be longer than delivery min time.',
    delivery_min_unit: 'business_day',
    delivery_max_unit: 'business_day',
    delivery_min: 10,
    delivery_max: 8,
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create shipping because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/shippings`)
        .send({
          ...validShippingData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`should fail to update shipping because ${message}`, async () => {
      const shipping = await createShipping();
      const response = await request(app)
        .put(`/api/shippings/${shipping._id}`)
        .send({
          ...validShippingData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`shoud fail to update many shippings because ${message}`, async () => {
      let shipping1 = await createShipping();
      let shipping2 = await createShipping();

      const response = await request(app)
        .put('/api/shippings')
        .set('Cookie', cookie)
        .send({
          updateList: [shipping1._id, shipping2._id],
          ...validShippingData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
