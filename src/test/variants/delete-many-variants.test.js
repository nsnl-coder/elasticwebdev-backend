const request = require('supertest');
const { app } = require('../../config/app');

it('returns 200 & successfully delete variants', async () => {
  // create 2 variants
  const variant1 = await request(app).post('/api/variants').send({
    price: 14,
  });

  const variant2 = await request(app).post('/api/variants').send({
    price: 14,
  });

  const id1 = variant1.body.data._id;
  const id2 = variant2.body.data._id;

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  //delete
  const response = await request(app)
    .delete('/api/variants')
    .send({
      deleteList: [id1, id2],
    });

  expect(response.body.deletedCount).toEqual(2);
});
