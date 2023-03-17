const yup = require('yup');

const userSchema = yup.object({
  body: yup.object({
    email: yup.string().email(),
    password: yup.string().min(8).max(255),
    fullname: yup.string().min(8).max(255),
    phone: yup
      .string()
      .matches(/^[0-9]{9,16}$/, 'Please provide valid phone number'),
  }),
});

module.exports = userSchema;
