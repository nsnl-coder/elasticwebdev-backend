import { createTransport } from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import { Transporter } from 'nodemailer';

const createMailTransport = (): Transporter | null => {
  let transporter: Transporter;

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.EMAIL_HOST) return null;
    if (!process.env.EMAIL_PORT) return null;
    if (!process.env.EMAIL_USER) return null;
    if (!process.env.EMAIL_PASS) return null;

    transporter = createTransport({
      // @ts-ignore
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else if (process.env.NODE_ENV === 'development') {
    if (!process.env.MAILTRAP_HOST) return null;
    if (!process.env.MAILTRAP_PORT) return null;
    if (!process.env.MAILTRAP_USER) return null;
    if (!process.env.MAILTRAP_PASS) return null;

    transporter = createTransport({
      // @ts-ignore
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }
  return null;
};

interface SendMailPayload {
  to: string;
  subject: string;
  pugFile: string;
  payload: any;
}

const sendEmail = async ({
  to,
  subject,
  pugFile,
  payload,
}: SendMailPayload) => {
  const html = pug.renderFile(
    `${__dirname}/../emailTemplates/${pugFile}`,
    payload,
  );
  const text = htmlToText(html);

  if (pugFile.startsWith('/')) {
    console.log('file name should not start with /');
    return;
  }

  const transporter = createMailTransport();

  if (!transporter) throw new Error('Unexpected error!');

  transporter.sendMail(
    {
      from: 'nsnhatlong <nsnl.coder@gmail.com>',
      to,
      subject,
      html,
      text,
    },
    (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    },
  );
};

// ================= Send email functions start from here ========================

export interface MailPayload {
  to: string;
  payload: any;
}

const sendVerifyEmail = async ({ to, payload }: MailPayload) => {
  const pugFile = 'transactional/verifyEmail.pug';
  const subject = 'You need to verify your email!';

  await sendEmail({ to, subject, pugFile, payload });
};

const sendForgotPasswordEmail = async ({ to, payload }: MailPayload) => {
  const pugFile = 'transactional/resetPassword.pug';
  const subject = 'Do you forget your password?';

  await sendEmail({ to, subject, pugFile, payload });
};

export { sendVerifyEmail, sendForgotPasswordEmail };
