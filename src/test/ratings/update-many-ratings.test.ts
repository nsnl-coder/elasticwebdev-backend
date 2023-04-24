import request from "supertest";;
import { app } from "../../config/app";;
import { createRating, validRatingData } from "./utils";;

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('returns 200 & successfully update the ratings', async () => {
  let rating1 = await createRating();
  let rating2 = await createRating();

  // update rating
  const id1 = rating1._id;
  const id2 = rating2._id;

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  const response = await request(app)
    .put('/api/ratings')
    .set('Cookie', cookie)
    .send({
      updateList: [id1, id2],
      ...validRatingData,
    })
    .expect(200);

  expect(response.body.modifiedCount).toEqual(2);

  // double check
  rating1 = await request(app)
    .get(`/api/ratings/${id1}`)
    .set('Cookie', cookie)
    .expect(200);

  rating2 = await request(app)
    .get(`/api/ratings/${id2}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(rating1.body.data).toMatchObject(validRatingData);
  expect(rating2.body.data).toMatchObject(validRatingData);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/ratings')
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
      .put('/api/ratings')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});

it('should return error if updateList contains invalid objectid', async () => {
  const response = await request(app)
    .put('/api/ratings')
    .send({
      updateList: ['id-not-valid', 'invalid-id'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(400);

  expect(response.body.message).toEqual('Data validation failed');
  expect(response.body.errors).toContain('Invalid ObjectId');
});

it('should return error if updateList contains non-existent objectid', async () => {
  const response = await request(app)
    .put('/api/ratings')
    .send({
      updateList: ['507f191e810c19729de860ea', '00000020f51bb4362eee2a4d'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual(
    'Can not find rating with provided ids',
  );
});
