const { string, boolean, object } = require('yup');

const userSchema = object({
  body: object({
    email: string().email().max(150).lowercase().label('email'),
    isPinned: boolean().label('isPinned'),
    fullname: string().min(6).max(255).lowercase().label('fullname'),
    phone: string()
      .matches(/^[0-9]{9,16}$/, 'Please provide valid phone number')
      .label('phone'),
    password: string().min(8).max(255).label('password'),
    profileImage: string().max(255).label('profileImage'),
  }),
});

module.exports = userSchema;
