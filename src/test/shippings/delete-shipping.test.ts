import request from "supertest";;
import { app } from "../../config/app";;
import { createShipping } from "./utils";;

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .delete('/api/shippings/some-id')
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
      .delete('/api/shippings/some-id')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });

  it('should return error if user is not admin', async () => {
    const { cookie } = await signup({
      email: 'test2@test.com',
    });

    const response = await request(app)
      .delete('/api/shippings/some-id')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
// ===========================================

it('should delete shipping', async () => {
  let shipping = await createShipping();
  const id = shipping._id;
  expect(id).toBeDefined();

  await request(app)
    .delete(`/api/shippings/${id}`)
    .set('Cookie', cookie)
    .expect(200);
});

it('should return error if objectid is invalid', async () => {
  const id = 'invalid-object-id';
  const { body } = await request(app)
    .delete(`/api/shippings/${id}`)
    .set('Cookie', cookie)
    .expect(400);
  expect(body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid does not exist', async () => {
  const id = '00000020f51bb4362eee2a4d';
  const { body } = await request(app)
    .delete(`/api/shippings/${id}`)
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Cant not find shipping with provided id');
});
