import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IUser } from '../yup/userSchema';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      enum: ['user', 'customer', 'admin', 'root'],
    },
    isPinned: Boolean,
    profileImage: String,
    fullname: String,
    phone: String,
    shippingAddress: String,
    password: String,
    //
    isVerified: {
      type: Boolean,
      default: false,
    },
    //
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    resetPasswordEmailsSent: {
      type: Number,
      default: 0,
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
    timestamps: true,
  },
);

// hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

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

const User = model<IUser>('user', userSchema);
export { User, userSchema };
