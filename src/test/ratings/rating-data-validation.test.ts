import request from "supertest";;
import { createRating, validRatingData } from "./utils";;
import { app } from "../../config/app";;
import { createProduct } from "../products/utils";;

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  // {
  //   field: 'stars',
  //   message:
  //     'Number of stars must be one of the following values: 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5',
  //   stars: 4.6,
  // },
  // {
  //   field: 'content',
  //   message: 'Rating content must be at most 255 characters',
  //   content: 'a'.repeat(256),
  // },
  {
    field: 'product',
    message: 'Invalid ObjectId',
    product: 'asddahuiva',
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
          product: product._id,
          ...validRatingData,
          ...invalidData,
        })
        .set('Cookie', cookie);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
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
      expect(response.body.errors).toContain(message);
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
      expect(response.body.errors).toContain(message);
    });
  },
);
