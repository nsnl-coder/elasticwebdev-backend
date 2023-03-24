const sendVerifyEmail = jest.fn(({ to, payload }) => {
  if (to !== 'test@test.com') {
    throw new Error('receiver is not correct!');
  }

  if (payload.fullname !== 'test name') {
    throw new Error('fullname is not correct');
  }

  // check if verify link is correct
  if (!payload.verifyLink.includes('/auth/verify-email/')) {
    throw new Error('verifyLink is not correct');
  }
});
const sendResetPasswordEmail = async ({ to, payload }) => {};

module.exports = {
  sendVerifyEmail,
  sendResetPasswordEmail: jest.fn(() => sendResetPasswordEmail),
};
