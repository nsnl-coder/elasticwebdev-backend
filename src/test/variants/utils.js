const request = require('supertest');
const { app } = require('../../config/app');

const createVariant = async (number = 1) => {
  const variants = [];

  for (let i = 0; i < number; i++) {
    const { body } = await request(app).post('/api/variants').send({
      price: 1,
    });
    variants.push(body);
  }

  if (number === 1) return variants[0];
  return variants;
};

module.exports = { createVariant };
