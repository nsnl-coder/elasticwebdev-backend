const request = require('supertest');
const { app } = require('../../config/app');

it('returns 200 & successfully creates variant', async () => {
  await request(app).post('/api/v1/variants').send({
    title: 'ajojo',
  });
});
