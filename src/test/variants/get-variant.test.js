const request = require('supertest');
const { app } = require('../../config/app');

it('returns 200 & successfully receives requested variant', async () => {
  // create variant
  const { body } = await request(app)
    .post('/api/variants')
    .send({
      price: 14,
    })
    .expect(201);

  // get variant
  const response = await request(app)
    .get(`/api/variants/${body.data._id}`)
    .expect(200);

  expect(response.body.data._id).toEqual(body.data._id);
});

it('should return error if objectid is not valid', async () => {
  // get variant
  const response = await request(app)
    .get(`/api/variants/12345678900`)
    .expect(400);

  expect(response.body.errors).toContain('Invalid ObjectId');
});
