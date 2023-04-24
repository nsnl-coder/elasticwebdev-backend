import request from 'supertest';
import { app } from '../../config/app';
import { createRating } from './utils';
import { signup } from '../setup';
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('should delete rating if user is admin', async () => {
  let rating = await createRating();
  const id = rating._id;
  expect(id).toBeDefined();

  await request(app)
    .delete(`/api/ratings/${id}`)
    .set('Cookie', cookie)
    .expect(200);
});

it('should delete rating if the rating created by user', async () => {
  const { cookie: ownerCookie } = await signup({
    email: 'user@user.com',
    _id: '642b8200fc13ae1d48f4cf20',
  });
  let rating = await createRating();
  const id = rating._id;
  expect(id).toBeDefined();

  await request(app)
    .delete(`/api/ratings/${id}`)
    .set('Cookie', ownerCookie)
    .expect(200);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .delete('/api/ratings/some-id')
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
      .delete('/api/ratings/some-id')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});

it('shoud not delete the rating if user did not create the rating', async () => {
  const rating = await createRating();
  const { cookie: userCookie } = await signup({
    email: 'user@user.com',
    role: 'user',
  });

  const { body } = await request(app)
    .delete(`/api/ratings/${rating._id}`)
    .set('Cookie', userCookie)
    .expect(403);

  expect(body.message).toEqual(
    'You do not have permission to perform this action',
  );
});

// ===========================================
it('should return error if objectid is invalid', async () => {
  const id = 'invalid-object-id';
  const { body } = await request(app)
    .delete(`/api/ratings/${id}`)
    .set('Cookie', cookie)
    .expect(400);
  expect(body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid does not exist', async () => {
  const id = '00000020f51bb4362eee2a4d';
  const { body } = await request(app)
    .delete(`/api/ratings/${id}`)
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Cant not find rating with provided id');
});
