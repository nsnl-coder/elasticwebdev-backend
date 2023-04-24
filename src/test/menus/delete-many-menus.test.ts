import request from 'supertest';
import { app } from '../../config/app';
import { createMenu } from './utils';
import { signup } from '../setup';
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = [];
    const response = await request(app)
      .delete('/api/menus')
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
      .delete('/api/menus')
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
      .delete('/api/menus')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

// ===============================================

it('should delete many menus', async () => {
  // create 2 menus
  const menu1 = await createMenu();
  const menu2 = await createMenu();

  const id1 = menu1._id;
  const id2 = menu2._id;

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  //delete
  const response = await request(app)
    .delete('/api/menus')
    .set('Cookie', cookie)
    .send({
      deleteList: [id1, id2],
    })
    .expect(200);

  expect(response.body.data.deletedCount).toEqual(2);
});

it('should return error if deleteList only contains invalid ObjectId', async () => {
  const response = await request(app)
    .delete('/api/menus')
    .set('Cookie', cookie)
    .send({
      deleteList: ['invalid-objectid', 'still-invalid-objectid'],
    })
    .expect(400);

  expect(response.body.errors).toContain('Invalid ObjectId');
});

it('should return error if deleteList is non-existent ObjectId', async () => {
  const response = await request(app)
    .delete('/api/menus')
    .set('Cookie', cookie)
    .send({
      deleteList: ['00000020f51bb4362eee2a4d', '00000020f51bb4362eee2a4d'],
    })
    .expect(404);

  expect(response.body.message).toEqual('Can not find menus with provided ids');
});

it('should delete menus if deleteList contains at least an existent objectid', async () => {
  const menu = await createMenu();
  const id = menu._id;
  expect(id).toBeDefined();

  // deleteList contain valid but non-existent objectid
  const response = await request(app)
    .delete('/api/menus')
    .set('Cookie', cookie)
    .send({
      deleteList: [id, '00000020f51bb4362eee2a4d'],
    })
    .expect(200);

  expect(response.body.data.deletedCount).toEqual(1);
});
