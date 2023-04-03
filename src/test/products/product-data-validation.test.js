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
    message: 'name too long',
    name: 'a'.repeat(256),
  },
  {
    field: 'status',
    message: 'status can only be draft or active',
    status: 'public',
  },
  {
    field: 'isPinned',
    message: 'wrong data type',
    isPinned: 'yes',
  },
  {
    field: 'price, discountPrice',
    message: 'discount price should be less than original price',
    price: 50,
    discountPrice: 100,
  },
  {
    field: 'images',
    message: 'images should be an array',
    images: 'wrong data type',
  },
  {
    field: 'previewImages',
    message: 'maximum 2 preview images',
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
    });
  },
);
