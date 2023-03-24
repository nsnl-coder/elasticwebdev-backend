const request = require('supertest');
const { app } = require('../../config/app');

it('successfully verify the email if token is correct', async () => {
  const { verifyToken, cookie } = await signup();

  const { body } = await request(app)
    .post(`/api/users/verify-email/${verifyToken}`)
    .expect(200);

  expect(body.message).toEqual('Your email has been verified!');

  // make sure that user is actually verified
  const response = await request(app)
    .get('/api/users/current-user')
    .set('Cookie', cookie);

  expect(response.body.data.email).toEqual('test@test.com');
  expect(response.body.data.isVerified).toEqual(true);
});

it('returns 400 if the token is not correct', async () => {
  const { body } = await request(app)
    .post('/api/users/verify-email/wrong-token')
    .send({
      password: 'password',
    })
    .expect(400);

  expect(body.message).toEqual('Token is invalid or has expired!');
});

it('returns 400 if the token is expired', async () => {
  // this makes the token expired
  process.env.VERIFY_EMAIL_TOKEN_EXPIRES = -1;
  const { verifyToken } = await signup();

  const { body } = await request(app)
    .post(`/api/users/verify-email/${verifyToken}`)
    .expect(400);

  expect(body.message).toEqual('Token is invalid or has expired!');
});
