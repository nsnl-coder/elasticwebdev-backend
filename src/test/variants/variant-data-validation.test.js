const request = require('supertest');
const { createVariant, validVariantData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'name',
    message: 'Variant name must be at most 255 characters',
    variantName: 's'.repeat(256),
  },
  {
    field: 'options',
    message: 'options must be a `array` type, but the final value was: `{}`.',
    options: {},
  },
  {
    field: 'options',
    message: 'options field must have less than or equal to 50 items',
    options: Array(51).fill({}),
  },
  {
    field: 'options[0]',
    message:
      'body.options[0] must be a `object` type, but the final value was: `55`.',
    options: [55],
  },
  {
    field: 'options[0]',
    message: 'body.options[0].optionName must be at most 255 characters',
    options: [
      {
        optionName: 'n'.repeat(256),
      },
    ],
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
      expect(response.body.errors).toContain(message);
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
      expect(response.body.errors).toContain(message);
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
      expect(response.body.errors).toContain(message);
    });
  },
);
