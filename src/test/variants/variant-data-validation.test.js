const request = require('supertest');
const { createVariant, validVariantData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  { field: 'name', message: 'name too long', name: 's'.repeat(256) },
  { field: 'options', message: 'options should be an array', options: {} },
  {
    field: 'options',
    message: 'options should has max length of 50',
    options: Array(51).fill({}),
  },
  {
    field: 'options',
    message: 'options should contain object only',
    options: Array(51).fill(5),
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create variant because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/variants`)
        .send({
          ...validVariantData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`should fail to update variant because ${message}`, async () => {
      const variant = await createVariant();
      const response = await request(app)
        .put(`/api/variants/${variant._id}`)
        .send({
          ...validVariantData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`shoud fail to update many variants because ${message}`, async () => {
      let variant1 = await createVariant();
      let variant2 = await createVariant();

      const response = await request(app)
        .put('/api/variants')
        .set('Cookie', cookie)
        .send({
          updateList: [variant1._id, variant2._id],
          ...validVariantData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });
  },
);
