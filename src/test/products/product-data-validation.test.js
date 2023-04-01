const request = require('supertest');
const { createProduct } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  // const { cookie: newCookie } = await signup({ role: 'admin' });
  // cookie = newCookie;
});

const validData = {};
let invalidData = [{}];

// ==============================================================
invalidData = invalidData.map((item) => [item]);

describe.skip.each(invalidData)('data validation', (invalidData) => {
  it(`shoud fail to create product because ${invalidData.error}`, async () => {
    const response = await request(app)
      .post(`/api/products`)
      .send({
        ...validData,
        ...invalidData,
      })
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });

  it(`should fail to update product because ${invalidData.error}`, async () => {
    const product = await createProduct();
    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .send({
        ...validData,
        ...invalidData,
      })
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });

  it(`shoud fail to update many products because ${invalidData.error}`, async () => {
    let product1 = await createProduct();
    let product2 = await createProduct();

    const response = await request(app)
      .put('/api/products')
      .set('Cookie', cookie)
      .send({
        updateList: [product1._id, product2._id],
        ...validData,
        ...invalidData,
      })
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });
});
