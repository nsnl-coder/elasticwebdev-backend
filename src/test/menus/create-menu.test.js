const request = require('supertest');
const { app } = require('../../config/app');
const { validMenuData, createMenu } = require('./utils');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('returns 200 & successfully creates menu', async () => {
  const menu = await createMenu();

  const { body } = await request(app)
    .post('/api/menus')
    .set('Cookie', cookie)
    .send({
      ...validMenuData,
      parentMenu: menu._id,
    })
    .expect(201);

  expect(body.data).toMatchObject(validMenuData);
});

it('should not create menu if parent menu not exist', async () => {
  const { body } = await request(app)
    .post('/api/menus')
    .set('Cookie', cookie)
    .send({
      ...validMenuData,
      parentMenu: '642b8200fc13ae1d48f4cf1f',
    })
    .expect(404);
});

it.skip.each(['email', 'password'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/menus')
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
      .post('/api/menus')
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
      .post('/api/menus')
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
      .post('/api/menus')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
