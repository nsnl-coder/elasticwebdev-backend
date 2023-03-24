const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

let transporter;

if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else if (process.env.NODE_ENV === 'development') {
  transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
}
const sendEmail = async ({ to, subject, pugFile, payload }) => {
  const html = pug.renderFile(
    `${__dirname}/../emailTemplates/${pugFile}`,
    payload,
  );
  const text = htmlToText(html);

  if (!to || !subject || !pugFile || !payload) {
    console.log('You must provide all the fields');
    return;
  }

  if (pugFile.startsWith('/')) {
    console.log('file name should not start with /');
    return;
  }

  await transporter.sendMail(
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

const sendVerifyEmail = async ({ to, payload }) => {
  const pugFile = 'transactional/verifyEmail.pug';
  const subject = 'You need to verify your email!';

  await sendEmail({ to, subject, pugFile, payload });
};

// (async () => {
//   await sendVerifyEmail({
//     to: 'nsnhatlong@gmail.com',
//     payload: {
//       verifyLink: 'https://amazon.vn',
//       fullname: 'nguyen sy nhat long',
//     },
//   });
// })();

module.exports = { sendVerifyEmail };
