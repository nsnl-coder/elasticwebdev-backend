const request = require('supertest');
const { app } = require('../../config/app');

it('returns 200 & successfully receives all variants', async () => {
  // create variant
  await request(app)
    .post('/api/variants')
    .send({
      price: 14,
    })
    .expect(201);

  await request(app)
    .post('/api/variants')
    .send({
      price: 16,
    })
    .expect(201);

  // get variant
  const response = await request(app).get('/api/variants').expect(200);

  expect(response.body.results).toEqual(2);
});

it('should work with fields query', async () => {
  const res = await request(app).get(`/api/variants?`);
});

it('should work with page query', async () => {});

it('should work with itemsPerPage', async () => {});

it('should work with page query + itemsPerPage', async () => {});

it('should work with skip query', async () => {});

it('should work with limit query', async () => {});

it('should work with any queries', async () => {});

it('should work with combination of query types', async () => {});
