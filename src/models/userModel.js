const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      enum: ['user', 'customer', 'admin'],
    },
    isPinned: Boolean,
    fullname: String,
    shippingAddress: String,
    phone: String,
    password: String,
    profileImage: String,
    //
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    resetPasswordEmailsSent: {
      type: Number,
      default: 0,
    },
    //
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: String,
    verifyTokenExpires: Date,
    verifyEmailsSent: {
      type: Number,
      default: 0,
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

const User = mongoose.model('user', userSchema);
module.exports = { User, userSchema };
