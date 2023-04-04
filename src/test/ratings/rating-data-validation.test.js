const request = require('supertest');
const { createRating, validRatingData } = require('./utils');
const { app } = require('../../config/app');
const { createProduct } = require('../products/utils');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'stars',
    stars: 4.6,
    message: 'star should be interger or .5 decimals',
  },
  {
    field: 'content',
    content: 'a'.repeat(256),
    message: 'content too long',
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create rating because ${message}`, async () => {
      const product = await createProduct();
      const response = await request(app)
        .post(`/api/ratings`)
        .send({
          ...validRatingData,
          ...invalidData,
          product: product._id,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`should fail to update rating because ${message}`, async () => {
      const rating = await createRating();
      const response = await request(app)
        .put(`/api/ratings/${rating._id}`)
        .send({
          ...validRatingData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`shoud fail to update many ratings because ${message}`, async () => {
      let rating1 = await createRating();
      let rating2 = await createRating();

      const response = await request(app)
        .put('/api/ratings')
        .set('Cookie', cookie)
        .send({
          updateList: [rating1._id, rating2._id],
          ...validRatingData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });
  },
);
