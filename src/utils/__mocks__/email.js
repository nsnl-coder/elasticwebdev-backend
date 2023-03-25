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

const sendForgotPasswordEmail = jest.fn(async ({ to, payload }) => {
  if (to !== 'test@test.com') {
    throw new Error('receiver is not correct!');
  }

  if (payload.fullname !== 'test name') {
    throw new Error('fullname is not correct');
  }

  // check if reset password link is correct
  if (!payload.resetLink.includes('/auth/reset-password/')) {
    throw new Error('verifyLink is not correct');
  }
});

module.exports = {
  sendVerifyEmail,
  sendForgotPasswordEmail,
};
