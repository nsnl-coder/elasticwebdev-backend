const { string, boolean, object } = require('yup');

const userSchema = object({
  body: object({
    email: string().email().max(150).lowercase(),
    isPinned: boolean(),
    fullname: string().min(6).max(255).lowercase(),
    phone: string().matches(
      /^[0-9]{9,16}$/,
      'Please provide valid phone number',
    ),
    password: string().min(8).max(255),
    profileImage: string().max(255),
  }),
});

module.exports = userSchema;
