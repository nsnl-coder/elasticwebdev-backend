const request = require('supertest');
const { createOrder, validOrderData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  { field: 'test_number', message: 'wrong data type', test_number: 'sss' },
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
    });

    it(`should fail to update order because ${message}`, async () => {
      const order = await createOrder();
      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .send({
          ...validOrderData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`shoud fail to update many orders because ${message}`, async () => {
      let order1 = await createOrder();
      let order2 = await createOrder();

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
    });
  },
);
