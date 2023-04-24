import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import hoursToMilliseconds from 'date-fns/hoursToMilliseconds';
import minutesToMilliseconds from 'date-fns/minutesToMilliseconds';
import bcrypt from 'bcrypt';

//
import { User } from '../models/userModel';
import { sendForgotPasswordEmail } from '../utils/email';
import { eventEmitter, MAIL_EVENTS } from '../config/eventEmitter';
import { NextFunction, Request, Response } from 'express';
import { IUser } from '../yup/userSchema';
import createError from '../utils/createError';

const signJwtToken = (id: string) => {
  if (!process.env.JWT_SECRET) {
    throw createError('Can not read jwt secret!');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return { token, hashedToken };
};

const resWithCookie = (
  req: Request,
  res: Response,
  user: IUser,
  statusCode: number,
  message: string,
) => {
  // send back jwt token as cookie
  const jwtToken = signJwtToken(user._id);

  res.cookie('jwt', jwtToken, {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res.status(statusCode).json({
    status: 'success',
    message,
    data: user,
  });
};

const getHashedToken = (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return hashedToken;
};

const isLoginPasswordCorrect = async function (
  candidatePassword: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// ============= IMPLEMENTATION =============

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, fullname, password } = req.body;

  // check if email already exists
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return res.status(400).json({
      status: 'fail',
      message: 'An account with provided email already exists',
    });
  }

  const { token, hashedToken } = createToken();

  // create new account
  const user = await User.create({
    email,
    password,
    fullname,
    verifyToken: hashedToken,
    verifyTokenExpires:
      Date.now() +
      hoursToMilliseconds(Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRES || 24)),
  });

  // send email verification email to user
  eventEmitter.emit(MAIL_EVENTS.USER_SIGN_UP, {
    to: user.email,
    fullname: user.fullname,
    token,
  });

  const message = 'Check your email inbox to verify your email!';
  resWithCookie(req, res, user, 201, message);
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const verifyToken = req.params.token;
  const hashedVerifyToken = getHashedToken(verifyToken);

  const user = await User.findOne({
    verifyToken: hashedVerifyToken,
    verifyTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: 'fail',
      message: 'Token is invalid or has expired!',
    });
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Your email has been verified!',
  });
};

const resendVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await User.findOne({ email: req.user.email });

  // check if user exists
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'An account with provided email does not exist!',
    });
  }

  // check if user is already verified
  if (user.isVerified) {
    return res.status(200).json({
      status: 'success',
      message: 'You account is already verified!',
    });
  }

  // check if old token is still valid

  let isEmailSentYesterDay: boolean = false;

  if (user.verifyTokenExpires) {
    const emailLastSentAt =
      Number(new Date(user.verifyTokenExpires)) -
      hoursToMilliseconds(Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRES));

    const difference = Date.now() - Number(new Date(emailLastSentAt));
    isEmailSentYesterDay = difference < hoursToMilliseconds(24);
  }

  if (user.verifyEmailsSent === 3 && isEmailSentYesterDay) {
    return res.status(400).json({
      status: 'fail',
      message:
        'You have reached maxium number of emails resend today! Try again tommorrow!',
    });
  }

  // if old token is not valid, reset number of email sents
  // this is to avoid user spam resend email route
  if (!isEmailSentYesterDay) {
    user.verifyEmailsSent = 0;
  }

  // create new token and send it to user inbox
  const { token, hashedToken } = createToken();

  user.verifyToken = hashedToken;
  user.verifyTokenExpires = new Date(
    Date.now() +
      hoursToMilliseconds(Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRES)),
  );

  user.verifyEmailsSent++;
  await user.save();

  // send email verification email to user
  eventEmitter.emit(MAIL_EVENTS.USER_SIGN_UP, {
    to: user.email,
    fullname: user.fullname,
    token,
  });

  res.status(200).json({
    status: 'success',
    message: 'An email has been sent to your inbox!',
  });
};

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // check if an account with provided email exists
  const user = await User.findOne({ email });

  // check if correct password provided
  const isLoginValid =
    user && (await isLoginPasswordCorrect(password, user.password!));

  if (!isLoginValid) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }

  // return cookie
  res.cookie('jwt', signJwtToken(user._id.toString()), {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // return account info
  const message = 'You have signed in!';
  resWithCookie(req, res, user, 200, message);
};

const signOut = (req: Request, res: Response, next: NextFunction) => {
  res.cookie('jwt', '');
  res.status(200).json({
    status: 'success',
    message: 'You successfully signed out',
  });
};

const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: 'success',
    data: req.user,
  });
};

const updateEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // check if provided password is correct
  const user = req.user;
  const isPasswordCorrect = await isLoginPasswordCorrect(
    password,
    user.password,
  );

  if (!isPasswordCorrect) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password is incorrect',
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { email },
    { new: true },
  );
  res.status(200).json({
    status: 'succcess',
    data: updatedUser,
  });
};

/**
 * this route is for user still remember their password but want to change it
 */
const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { oldPassword, password } = req.body;

  // check if provided password is correct
  const user = req.user;
  const isPasswordCorrect = await isLoginPasswordCorrect(
    oldPassword,
    user.password,
  );

  if (!isPasswordCorrect) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password is incorrect',
    });
  }
  user.password = password;
  await user.save();

  const message = 'You successfully changed your password';
  resWithCookie(req, res, user, 200, message);
};

const updateUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    email,
    password,
    fullname,
    shippingAddress,
    phone,
    isPinned,
    profileImage,
  } = req.body;

  if (email) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please use /api/auth/update-email route to update email',
    });
  }

  if (password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please use /api/auth/update-password route to update password',
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      fullname,
      shippingAddress,
      phone,
      isPinned,
      profileImage,
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

/**
 * use this route if user forgot their password
 * send an email to user with a link. User can change their password from the link.
 */
const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // returns 404 if can't find user
  if (!user) {
    return res.status(404).json({
      status: 'success',
      message: 'An user with this email does not exist',
    });
  }

  if (user.resetPasswordTokenExpires) {
    const emailLastSentAt =
      Number(new Date(user.resetPasswordTokenExpires)) -
      minutesToMilliseconds(Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES));

    const difference = Date.now() - Number(new Date(emailLastSentAt));
    const isSentYesterday = difference < hoursToMilliseconds(24);

    if (isSentYesterday && user.resetPasswordEmailsSent === 3) {
      return res.status(400).json({
        status: 'fail',
        message: 'Too many requests! Please try to request again in 24 hours',
      });
    }

    if (!isSentYesterday) {
      user.resetPasswordEmailsSent = 0;
    }
  }

  // save token to db
  const { token, hashedToken } = createToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordEmailsSent++;

  user.resetPasswordTokenExpires = new Date(
    Date.now() +
      minutesToMilliseconds(Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES)),
  ); // 15 min only
  await user.save();

  // send password reset email to user
  await sendForgotPasswordEmail({
    to: user.email!,
    payload: {
      resetLink: `${process.env.FRONTEND_HOST}/auth/reset-password/${token}`,
      fullname: user.fullname,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'We sent you an email! Please check your inbox!',
  });
};

/**
 * user this route to reset password for those who forgot their password
 */
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.params.token;
  const { password } = req.body;
  const hashedToken = getHashedToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return res.status(400).json({
      status: 'fail',
      message: 'The token is invalid or expired!',
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'You successfully change your password!',
  });
};

export {
  signUp,
  verifyEmail,
  resendVerifyEmail,
  signIn,
  signOut,
  updateEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateUserInfo,
  getCurrentUser,
  // for testing
  signJwtToken,
  createToken,
};
