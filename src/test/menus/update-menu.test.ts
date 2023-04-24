import request from "supertest";;
import { app } from "../../config/app";;
import { createMenu, validMenuData } from "./utils";;

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('shoud update the menu', async () => {
  const menu = await createMenu();
  const menu2 = await createMenu();

  const { body } = await request(app)
    .put(`/api/menus/${menu._id}`)
    .send({
      ...validMenuData,
      parentMenu: menu2._id,
    })
    .set('Cookie', cookie)
    .expect(200);

  expect(body.data).toMatchObject(validMenuData);
});

it('shoud not update the menu if parent menu does not exist', async () => {
  const menu = await createMenu();

  const { body } = await request(app)
    .put(`/api/menus/${menu._id}`)
    .send({
      ...validMenuData,
      parentMenu: '642b8200fc13ae1d48f4cf1d',
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find parentMenu with provided id');
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/menus/some-id')
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
      .put('/api/menus/some-id')
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
      .put('/api/menus/some-id')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

// ===========================================

it('should return error if objectid is not valid', async () => {
  const { body } = await request(app)
    .put('/api/menus/not-valid-objectid')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(400);

  expect(body.message).toEqual('Data validation failed');
  expect(body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid does not exist in db', async () => {
  const { body } = await request(app)
    .put('/api/menus/00000020f51bb4362eee2a4d')
    .send({
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(body.message).toEqual('Can not find menu with provided id');
});
