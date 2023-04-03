const request = require('supertest');
const { createShipping, validShippingData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  { field: 'name', message: 'name too long', name: 's'.repeat(256) },
  { field: 'fees', message: 'fees too high', fees: 1000 },
  { field: 'fees', message: 'wrong datatype', fees: 'wrong' },
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
    });
  },
);
