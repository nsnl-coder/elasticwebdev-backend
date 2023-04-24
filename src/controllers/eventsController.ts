import { sendVerifyEmail, sendForgotPasswordEmail } from '../utils/email';

// event trigger an email send
interface VerifyMailPayload {
  to: string;
  fullname: string;
  token: string;
}

const onUserSignUp = async ({ to, fullname, token }: VerifyMailPayload) => {
  await sendVerifyEmail({
    to,
    payload: {
      verifyLink: `${process.env.FRONTEND_HOST}/auth/verify-email/${token}`,
      fullname,
    },
  });
};

export { onUserSignUp };
