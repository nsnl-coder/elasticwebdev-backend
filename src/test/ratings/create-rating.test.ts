import request from "supertest";;
import { app } from "../../config/app";;
import { createProduct } from "../products/utils";;
import { validRatingData } from "./utils";;

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup();
  cookie = newCookie;
});

it('returns 200 & successfully creates rating', async () => {
  const product = await createProduct();

  const { body } = await request(app)
    .post('/api/ratings')
    .set('Cookie', cookie)
    .send({
      ...validRatingData,
      product: product._id,
    })
    .expect(201);

  expect(body.data).toMatchObject(validRatingData);
});

it('returns 200 & successfully creates rating', async () => {
  const product = await createProduct();

  await request(app)
    .post('/api/ratings')
    .set('Cookie', cookie)
    .send({
      ...validRatingData,
      product: product._id,
    })
    .expect(201);

  const { body } = await request(app)
    .post('/api/ratings')
    .set('Cookie', cookie)
    .send({
      ...validRatingData,
      product: product._id,
    })
    .expect(400);

  expect(body.message).toEqual(
    'You already rated this product! You can delete or update your old rating!',
  );
});

it('should not create rating if product not exist', async () => {
  await request(app)
    .post('/api/ratings')
    .set('Cookie', cookie)
    .send({
      ...validRatingData,
      product: '642b8200fc13ae1d48f4cf1e',
    })
    .expect(404);
});

it.each(['stars', 'product', 'content'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/ratings')
      .send({
        // add payload here
        [field]: undefined,
      })
      .set('Cookie', cookie)
      .expect(400);

    // also check if it return correct message
    expect(body.errors).toContain(`${field} is required`);
  },
);

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .post('/api/ratings')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toBe(
      'You are not logged in! Please logged in to perform the action',
    );
  });

  it('should return error if user is not verified', async () => {
    const { cookie } = await signup({
      isVerified: false,
      email: 'test2@test.com',
    });

    const response = await request(app)
      .post('/api/ratings')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});
