const request = require('supertest');
const { app } = require('../../config/app');
const { User } = require('../../models/userModel');
const { sendForgotPasswordEmail } = require('../../utils/email');

const requestEmail = async () => {
  await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(200);
};

it('returns 200 & sends email with token to user', async () => {
  await signup();

  const { body } = await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(200);

  expect(body.message).toEqual(
    'We sent you an email! Please check your inbox!',
  );
  // check if email has been sent
  expect(sendForgotPasswordEmail).toHaveBeenCalled();
});

it('allows unverified user to request forgot password email', async () => {
  await signup({ isVerified: false });

  const { body } = await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(200);

  expect(sendForgotPasswordEmail).toHaveBeenCalled();
  expect(body.message).toEqual(
    'We sent you an email! Please check your inbox!',
  );
});

it('return 404 if an user with provided email does not exist', async () => {
  const { body } = await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'noexistuser@test.com' })
    .expect(404);

  expect(body.message).toEqual('An user with this email does not exist');
});

it('returns 400 if user already requested 3 emails in 24 hours', async () => {
  await signup();
  // request 3 times
  await requestEmail();
  await requestEmail();
  await requestEmail();

  //
  const { body } = await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(400);

  expect(body.message).toEqual(
    'Too many requests! Please try to request again in 24 hours',
  );
});

it('returns allow user to request email after 24 hours of blocking', async () => {
  await signup();
  // request 3 times
  await requestEmail();
  await requestEmail();
  await requestEmail();

  // blocking email
  await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(400);

  // make the expired time backward 2 days
  await User.findOneAndUpdate(
    { email: 'test@test.com' },
    { resetPasswordTokenExpires: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  );

  // request 3 times
  await requestEmail();
  await requestEmail();
  await requestEmail();

  // it got blocked again
  await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(400);
});
