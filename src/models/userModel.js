const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  fullname: {
    type: String,
    lowercase: true,
  },
  shippingAddress: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default:
      'https://soccerpointeclaire.com/wp-content/uploads/2021/06/default-profile-pic-e1513291410505.jpg',
  },
  passwordChangedAt: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
});

const User = mongoose.model('user', userSchema);

module.exports = User;
