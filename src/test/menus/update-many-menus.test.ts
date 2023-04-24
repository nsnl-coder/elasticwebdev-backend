import request from 'supertest';
import { app } from '../../config/app';
import { createMenu, validMenuData } from './utils';
import { signup } from '../setup';
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('returns 200 & successfully update the menus', async () => {
  let menu1 = await createMenu();
  let menu2 = await createMenu();

  // update menu
  const id1 = menu1._id;
  const id2 = menu2._id;

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  const response = await request(app)
    .put('/api/menus')
    .set('Cookie', cookie)
    .send({
      updateList: [id1, id2],
      ...validMenuData,
    })
    .expect(200);

  expect(response.body.modifiedCount).toEqual(2);

  // double check
  menu1 = await request(app)
    .get(`/api/menus/${id1}`)
    .set('Cookie', cookie)
    .expect(200);

  menu2 = await request(app)
    .get(`/api/menus/${id2}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(menu1.body.data).toMatchObject(validMenuData);
  expect(menu2.body.data).toMatchObject(validMenuData);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .put('/api/menus')
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
      .put('/api/menus')
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
      .put('/api/menus')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

it('should return error if updateList contains invalid objectid', async () => {
  const response = await request(app)
    .put('/api/menus')
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
    .put('/api/menus')
    .send({
      updateList: ['507f191e810c19729de860ea', '00000020f51bb4362eee2a4d'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual('Can not find menu with provided ids');
});
