import request from 'supertest';
import { app } from '../../config/app';
import { signup } from '../setup';
it('return 200 if successfully update email', async () => {
  const { cookie } = await signup();

  const response = await request(app)
    .put('/api/auth/update-email')
    .set('Cookie', cookie)
    .send({
      email: 'test2@test.com',
      password: 'password',
    })
    .expect(200);

  // return new user with new email
  expect(response.body.data.email).toBe('test2@test.com');

  // try to log in with new email
  await request(app)
    .post('/api/auth/sign-in')
    .send({
      email: 'test2@test.com',
      password: 'password',
    })
    .expect(200);

  // make sure it failed to log in with old email
  await request(app)
    .post('/api/auth/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('should return error if user is not logged in', async () => {
  const response = await request(app)
    .put('/api/auth/update-email')
    .send({
      email: 'test2@test.com',
      password: 'password',
    })
    .expect(401);

  // expect correct message
  expect(response.body.message).toBe(
    'You are not logged in! Please logged in to perform the action',
  );
});

it('should return error if provided password is incorrect', async () => {
  const { cookie } = await signup();

  const response = await request(app)
    .put('/api/auth/update-email')
    .set('Cookie', cookie)
    .send({
      email: 'test2@test.com',
      password: 'passwordincorrect',
    });
  // .expect(400);

  // expect correct message
  expect(response.body.message).toBe('Password is incorrect');
});

it('should return error if new email is not a valid email', async () => {
  const { cookie } = await signup();

  const response = await request(app)
    .put('/api/auth/update-email')
    .set('Cookie', cookie)
    .send({
      email: 'test2test.com',
      password: 'password',
    })
    .expect(400);

  // expect correct message
  expect(response.body.errors).toContain('email must be a valid email');
});
