const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
    },
    fullname: {
      type: String,
      lowercase: true,
      required: true,
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
    resetPasswordTokenExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
    verifyTokenExpires: {
      type: Date,
    },
    // make sure that an user can only request 5 verification email resend max in 1 day
    verifyEmailsSent: {
      type: Number,
      default: 1,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.__v;
        delete ret.verifyToken;
        delete ret.verifyTokenExpires;
        delete ret.verifyEmailsSent;
      },
    },
  },
);

// check if login password correct
userSchema.methods.isLoginPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// exclude __v field
userSchema.pre(/^find/, function (next) {
  this.select('-__v -updatedAt');
  next();
});

//  create reset password token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;

const User = mongoose.model('user', userSchema);

module.exports = User;
