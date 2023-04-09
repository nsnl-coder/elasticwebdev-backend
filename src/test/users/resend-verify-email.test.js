const request = require('supertest');
const { app } = require('../../config/app');
const { verifyEmail } = require('../../controllers/authController');

const { sendVerifyEmail } = require('../../utils/email');

// reusable function for successful request only
async function requestResendEmail() {
  await request(app)
    .post('/api/auth/resend-verify-email')
    .send({
      email: 'test@test.com',
    })
    .expect(200);
}

it('successfully resends verification email', async () => {
  await signup({ isVerified: false });
  const { body } = await request(app)
    .post('/api/auth/resend-verify-email')
    .send({
      email: 'test@test.com',
    })
    .expect(200);

  expect(sendVerifyEmail).toHaveBeenCalled();
  expect(body.message).toEqual('An email has been sent to your inbox!');
});

describe('invalid email', () => {
  it('returns 400 if email is missing', async () => {
    await signup({ isVerified: false });
    const { body } = await request(app)
      .post('/api/auth/resend-verify-email')
      .expect(400);

    expect(body.message).toEqual('missing required field');
    expect(body.errors).toContain('email is required');
  });

  it('returns 400 if an user with provided email does not exist', async () => {
    const { body } = await request(app)
      .post('/api/auth/resend-verify-email')
      .send({
        email: 'test@test.com',
      })
      .expect(404);

    expect(body.message).toEqual(
      'An account with provided email does not exist!',
    );
    expect(sendVerifyEmail).not.toHaveBeenCalled();
  });
});

describe('limit 3 emails per day', () => {
  it('returns 400 if user already requested to resend email 3 times in 24 hours', async () => {
    await signup({ isVerified: false });
    // first 3 times
    await requestResendEmail();
    await requestResendEmail();
    await requestResendEmail();

    // 4th: expected failure
    const { body } = await request(app)
      .post('/api/auth/resend-verify-email')
      .send({
        email: 'test@test.com',
      });
    // .expect(400);

    expect(body.message).toEqual(
      'You have reached maxium number of emails resend today! Try again tommorrow!',
    );
    expect(sendVerifyEmail).toHaveBeenCalledTimes(3);
  });

  it('successfully resends email the next day although he requested 3 times yesterday', async () => {
    await signup({ isVerified: false });
    //
    await requestResendEmail();
    await requestResendEmail();
    // make the time pass through
    process.env.VERIFY_EMAIL_TOKEN_EXPIRES = -1;
    await requestResendEmail();

    process.env.VERIFY_EMAIL_TOKEN_EXPIRES = 24;
    await request(app)
      .post('/api/auth/resend-verify-email')
      .send({
        email: 'test@test.com',
      })
      .expect(200);

    // double if this fail again
    await requestResendEmail();
    await requestResendEmail();
    // fails to send email if user send 3 resend email requests in that day
    await request(app)
      .post('/api/auth/resend-verify-email')
      .send({
        email: 'test@test.com',
      })
      .expect(400);
    // user can only request 6 emails in 2 days
    expect(sendVerifyEmail).toHaveBeenCalledTimes(6);
  });
});

it('does not resend email if user is already verified', async () => {
  await signup();
  const { body } = await request(app)
    .post('/api/auth/resend-verify-email')
    .send({
      email: 'test@test.com',
    })
    .expect(200);

  expect(sendVerifyEmail).not.toHaveBeenCalled();
  expect(body.message).toEqual('You account is already verified!');
});
