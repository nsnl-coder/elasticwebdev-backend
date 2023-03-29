const request = require('supertest');
const { app } = require('../../config/app');

it('returns 200 & successfully update the variants', async () => {
  // create a variant
  let variant1 = await request(app)
    .post('/api/variants')
    .send({
      price: 14,
    })
    .expect(201);

  // create a variant
  let variant2 = await request(app)
    .post('/api/variants')
    .send({
      price: 14,
    })
    .expect(201);

  //
  expect(variant1.body.data.price).toEqual(14);
  expect(variant2.body.data.price).toEqual(14);

  // update variant
  const id1 = variant1.body.data._id;
  const id2 = variant2.body.data._id;

  const response = await request(app)
    .put('/api/variants')
    .send({
      updateList: [id1, id2],
      payload: {
        price: 24,
      },
    })
    .expect(200);

  expect(response.body.modifiedCount).toEqual(2);

  // double check
  variant1 = await request(app).get(`/api/variants/${id1}`);
  variant2 = await request(app).get(`/api/variants/${id2}`);
  expect(variant1.body.data.price).toEqual(24);
  expect(variant2.body.data.price).toEqual(24);
});
