const request = require('supertest');
const { app } = require('../../config/app');
const { sendResetPasswordEmail } = require('../../utils/email');

it('returns 200 & sends email with token to user', async () => {
  await signup();

  const { body } = await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(200);

  expect(sendResetPasswordEmail).toHaveBeenCalled();
  expect(body.message).toEqual(
    'We sent you an email! Please check your inbox!',
  );

  // check if token has been save to db
});

it('return 404 if an user with provided email does not exist', async () => {
  const { body } = await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'noexistuser@test.com' })
    .expect(404);

  expect(body.message).toEqual('An user with this email does not exist');
});

it('returns 400 if user already requested 3 emails in 24 hours', () => {});
