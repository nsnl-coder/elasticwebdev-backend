const request = require('supertest');
const { app } = require('../../config/app');
const { createToken } = require('../../controllers/userController');
const User = require('../../models/userModel');

it('returns 200 & successfully changed password with correct token', async () => {
  await signup();

  // send request to get forgot password email
  await request(app)
    .post('/api/users/forgot-password')
    .send({ email: 'test@test.com' })
    .expect(200);

  // because token is not saved to db, need to fake it
  const { token, hashedToken } = createToken();
  const user = await User.findOne({ email: 'test@test.com' });
  // hashed token should be defined
  expect(user.resetPasswordToken).toBeDefined();
  user.resetPasswordToken = hashedToken;
  await user.save();

  // test the route
  const { body } = await request(app)
    .put(`/api/users/reset-password/${token}`)
    .send({ password: 'newpassword' })
    .expect(200);

  expect(body.message).toEqual('You successfully change your password!');
  // resetPasswordToken should be removed
  const updatedUser = await User.findOne({ email: 'test@test.com' });
  expect(updatedUser.resetPasswordToken).not.toBeDefined();
  expect(updatedUser.email).toEqual('test@test.com');

  // login with new password
  await request(app)
    .post(`/api/users/sign-in`)
    .send({ email: 'test@test.com', password: 'newpassword' })
    .expect(200);
  // login with old password
  await request(app)
    .post(`/api/users/sign-in`)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(400);
});

it('returns 400 if the password is missing', async () => {
  const { body } = await request(app)
    .put(`/api/users/reset-password/some-fake-token`)
    .expect(400);

  expect(body.message).toEqual('missing required field');
  expect(body.errors).toContain('password is required');
});

it('returns 400 & fails to change password with invalid token', async () => {
  const { body } = await request(app)
    .put(`/api/users/reset-password/some-fake-token`)
    .send({ password: 'newpassword' })
    .expect(400);

  expect(body.message).toEqual('The token is invalid or expired!');
});

it('returns 400 & fails to change password with expired token', async () => {
  await signup();

  // because token is not saved to db, need to fake it
  const { token, hashedToken } = createToken();
  const user = await User.findOne({ email: 'test@test.com' });
  user.resetPasswordToken = hashedToken;
  user.resetPasswordTokenExpires = Date.now() - 15 * 60 * 60;
  await user.save();

  // can not change password when time is expired
  const { body } = await request(app)
    .put(`/api/users/reset-password/${token}`)
    .send({ password: 'newpassword' })
    .expect(400);
  //
  expect(body.message).toEqual('The token is invalid or expired!');
});
