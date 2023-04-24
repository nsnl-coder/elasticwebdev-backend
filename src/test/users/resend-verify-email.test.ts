import request from 'supertest';
import { app } from '../../config/app';

import { sendVerifyEmail } from '../../utils/email';
import { signup } from '../setup';

let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ isVerified: false });
  cookie = newCookie;
});

// reusable function for successful request only
async function requestResendEmail() {
  await request(app)
    .post('/api/auth/resend-verify-email')
    .send()
    .set('Cookie', cookie)
    .expect(200);
}

it('successfully resends verification email', async () => {
  const { body } = await request(app)
    .post('/api/auth/resend-verify-email')
    .send({
      email: 'test@test.com',
    })
    .set('Cookie', cookie)
    .expect(200);

  expect(sendVerifyEmail).toHaveBeenCalled();
  expect(body.message).toEqual('An email has been sent to your inbox!');
});

describe('limit 3 emails per day', () => {
  it('returns 400 if user already requested to resend email 3 times in 24 hours', async () => {
    // first 3 times
    await requestResendEmail();
    await requestResendEmail();
    await requestResendEmail();

    // 4th: expected failure
    const { body } = await request(app)
      .post('/api/auth/resend-verify-email')
      .send()
      .set('Cookie', cookie)
      .expect(400);

    expect(body.message).toEqual(
      'You have reached maxium number of emails resend today! Try again tommorrow!',
    );
    expect(sendVerifyEmail).toHaveBeenCalledTimes(3);
  });

  it('successfully resends email the next day although he requested 3 times yesterday', async () => {
    await requestResendEmail();
    await requestResendEmail();
    // make the time pass through
    process.env.VERIFY_EMAIL_TOKEN_EXPIRES = '-1';
    await requestResendEmail();

    process.env.VERIFY_EMAIL_TOKEN_EXPIRES = '24';
    await request(app)
      .post('/api/auth/resend-verify-email')
      .send()
      .set('Cookie', cookie)
      .expect(200);

    // double check if this fail again
    await requestResendEmail();
    await requestResendEmail();
    // fails to send email if user send 3 resend email requests in that day
    await request(app)
      .post('/api/auth/resend-verify-email')
      .send()
      .set('Cookie', cookie)
      .expect(400);
    // user can only request 6 emails in 2 days
    expect(sendVerifyEmail).toHaveBeenCalledTimes(6);
  });
});

it('does not resend email if user is already verified', async () => {
  const { cookie } = await signup({ email: 'verified@test.com' });
  const { body } = await request(app)
    .post('/api/auth/resend-verify-email')
    .send()
    .set('Cookie', cookie)
    .expect(200);

  expect(sendVerifyEmail).not.toHaveBeenCalled();
  expect(body.message).toEqual('You account is already verified!');
});
