const request = require('supertest');
const { createProduct, validProductData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'name',
    message: 'Product name must be at most 255 characters',
    name: 'a'.repeat(256),
  },
  {
    field: 'status',
    message:
      'Product status must be one of the following values: draft, active',
    status: 'public',
  },
  {
    field: 'isPinned',
    message:
      'isPinned must be a `boolean` type, but the final value was: `"yes"`.',
    isPinned: 'yes',
  },
  {
    field: 'price, discountPrice',
    message: 'Discount price must be smaller than current price',
    price: 50,
    discountPrice: 100,
  },
  {
    field: 'images',
    message:
      'Product images must be a `array` type, but the final value was: `"wrong data type"`.',
    images: 'wrong data type',
  },
  {
    field: 'previewImages',
    message: 'Preview images field must have less than or equal to 2 items',
    previewImages: ['one', 'two', 'three'],
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create product because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/products`)
        .send({
          ...validProductData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`should fail to update product because ${message}`, async () => {
      const product = await createProduct();
      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send({
          ...validProductData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`shoud fail to update many products because ${message}`, async () => {
      let product1 = await createProduct();
      let product2 = await createProduct();

      const response = await request(app)
        .put('/api/products')
        .set('Cookie', cookie)
        .send({
          updateList: [product1._id, product2._id],
          ...validProductData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
