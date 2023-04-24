import request from "supertest";;
import { app } from "../../config/app";;

it('successfully changes password', async () => {
  const { cookie } = await signup();

  // successfully changes password
  await request(app)
    .put('/api/auth/update-password')
    .set('Cookie', cookie)
    .send({ oldPassword: 'password', password: 'newpassword' })
    .expect(200);

  // it successfully logs in with newpassword
  await request(app)
    .post('/api/auth/sign-in')
    .send({
      email: 'test@test.com',
      password: 'newpassword',
    })
    .expect(200);

  // it fails to log in with old password
  const { body } = await request(app)
    .post('/api/auth/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);

  expect(body.message).toBe('Invalid email or password');
});

it('returns 401 if user is not logged in', async () => {
  const response = await request(app)
    .put('/api/auth/update-password')
    .send({ oldPassword: 'password', password: 'newpassword' })
    .expect(401);

  // expect correct message
  expect(response.body.message).toBe(
    'You are not logged in! Please logged in to perform the action',
  );
});

describe('data validation', () => {
  it('returns 400 if old password is missing or new password is missing', async () => {
    const { cookie } = await signup();

    // old password is missing
    await request(app)
      .put('/api/auth/update-password')
      .set('Cookie', cookie)
      .send({ password: 'newpassword' })
      .expect(400);

    // new password is missing
    await request(app)
      .put('/api/auth/update-password')
      .set('Cookie', cookie)
      .send({ oldPassword: 'password' })
      .expect(400);
  });

  it('returns 400 if new password is not valid', async () => {
    const { cookie } = await signup();

    const response = await request(app)
      .put('/api/auth/update-password')
      .set('Cookie', cookie)
      .send({ oldPassword: 'password', password: '22' })
      .expect(400);

    // expect correct message
    expect(response.body.message).toBe('Data validation failed');
  });
});

it('returns 400 if old password is incorrect', async () => {
  const { cookie } = await signup();

  const response = await request(app)
    .put('/api/auth/update-password')
    .set('Cookie', cookie)
    .send({ oldPassword: 'passwordincorrect', password: 'newpassword' })
    .expect(400);

  // expect correct message
  expect(response.body.message).toBe('Password is incorrect');
});
