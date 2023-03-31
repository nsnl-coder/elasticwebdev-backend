const { sendVerifyEmail, sendForgotPasswordEmail } = require('../utils/email');

// event trigger an email send
const onUserSignUp = async ({ to, fullname, token }) => {
  await sendVerifyEmail({
    to,
    payload: {
      verifyLink: `${process.env.FRONTEND_HOST}/auth/verify-email/${token}`,
      fullname,
    },
  });
};

module.exports = {
  onUserSignUp,
};
