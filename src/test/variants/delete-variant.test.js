const request = require('supertest');
const { app } = require('../../config/app');

it('returns 200 & successfully delete variants', async () => {
  // create a variant
  let variant = await request(app)
    .post('/api/variants')
    .send({
      price: 14,
    })
    .expect(201);

  const id = variant.body.data._id;
  expect(id).toBeDefined();

  await request(app).delete(`/api/variants/${id}`).expect(200);
});
