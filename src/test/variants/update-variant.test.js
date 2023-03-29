const request = require('supertest');
const { app } = require('../../config/app');

it('returns 200 & successfully update the variant', async () => {
  // create a variant
  const repsonse = await request(app)
    .post('/api/variants')
    .send({
      price: 14,
    })
    .expect(201);

  expect(repsonse.body.data.price).toEqual(14);

  // update variant
  const { body } = await request(app)
    .post('/api/variants')
    .send({
      price: 24,
    })
    .expect(201);

  expect(body.data.price).toEqual(24);
});
