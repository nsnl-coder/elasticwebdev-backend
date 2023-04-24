import request from 'supertest';
import { app } from '../../config/app';
import { signJwtToken } from '../../controllers/authController';
import { delay, jwt2Cookie, signup } from '../setup';
it('returns user data if user signed in', async () => {
  const { cookie } = await signup();

  const response = await request(app)
    .get('/api/auth/current-user')
    .set('Cookie', cookie)
    .expect(200);

  // expect correct message
  expect(response.body.data.email).toBe('test@test.com');
});

describe('auth check', () => {
  it('returns 401 if user is not logged in', async () => {
    const response = await request(app)
      .get('/api/auth/current-user')
      .expect(401);

    // expect correct message
    expect(response.body.message).toBe(
      'You are not logged in! Please logged in to perform the action',
    );
  });

  it('returns 200 if user is not verified', async () => {
    const { cookie } = await signup({ isVerified: false });

    await request(app)
      .get('/api/auth/current-user')
      .set('Cookie', cookie)
      .expect(200);
  });

  it('returns 400 if jwt token is expired', async () => {
    // make the cookie expired right away
    process.env.JWT_EXPIRES_IN = '0';
    const { cookie } = await signup();

    const { body } = await request(app)
      .get('/api/auth/current-user')
      .set('Cookie', cookie)
      .expect(400);

    expect(body.message).toEqual('jwt expired');
    // reset env variable
    process.env.JWT_EXPIRES_IN = '24d';
  });

  it('returns 400 if encoded user id is not a valid id', async () => {
    const jwtToken = signJwtToken('dsassad');
    const cookie = jwt2Cookie(jwtToken);

    const { body } = await request(app)
      .get('/api/auth/current-user')
      .set('Cookie', cookie)
      .expect(400);

    expect(body.message).toEqual(
      'Cast to ObjectId failed for value "dsassad" (type string) at path "_id" for model "user"',
    );
  });

  it('returns 404 if user with provided token does not exist', async () => {
    const jwtToken = signJwtToken('507f1f77bcf86cd799439011');
    const cookie = jwt2Cookie(jwtToken);

    const { body } = await request(app)
      .get('/api/auth/current-user')
      .set('Cookie', cookie)
      .expect(404);

    expect(body.message).toEqual('Cant find an user belongs to provided token');
  });

  it('returns 400 if send invalid jwt token', async () => {
    // make the cookie expired right away
    const cookie = jwt2Cookie('this jwt is not valid');

    const { body } = await request(app)
      .get('/api/auth/current-user')
      .set('Cookie', cookie)
      .expect(400);

    expect(body.message).toEqual('jwt malformed');
  });
});

it('can not get current user using old jwt token if user recently change their password', async () => {
  const { cookie, user } = await signup();

  // cookie works
  await request(app)
    .get('/api/auth/current-user')
    .set('Cookie', cookie)
    .expect(200);

  // 1000ms is correct wait time
  await delay(1000);

  // change password
  await request(app)
    .put('/api/auth/update-password')
    .set('Cookie', cookie)
    .send({
      oldPassword: 'password',
      password: 'newpassword',
    })
    .expect(200);

  // jwt no longer work because password recently change
  const { body } = await request(app)
    .get('/api/auth/current-user')
    .set('Cookie', cookie)
    .expect(400);

  expect(body.message).toEqual(
    'You recently changed password, please login again!',
  );
});
