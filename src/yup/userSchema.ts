import { string, boolean, object, InferType } from 'yup';
import { reqParams, reqQuery } from 'yup-schemas';

const reqBody = object({
  email: string().email().max(150).lowercase().label('email'),
  isPinned: boolean().label('isPinned'),
  fullname: string().min(6).max(255).lowercase().label('fullname'),
  phone: string()
    .matches(/^[0-9]{9,16}$/, 'Please provide valid phone number')
    .label('Phone number'),
  shippingAddress: string().max(255),
  password: string().min(8).max(255).label('password'),
  profileImage: string().max(255).label('profileImage'),
});

const userSchema = object({
  body: reqBody,
  reqQuery: reqQuery,
  reqParams: reqParams,
});

interface IUser extends InferType<typeof reqBody> {
  _id: string;
  role: 'user' | 'customer' | 'admin' | 'root';
  isVerified: boolean;
  passwordChangedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  resetPasswordEmailsSent: number;
  verifyToken?: string;
  verifyTokenExpires?: Date;
  verifyEmailsSent: number;
}

export default userSchema;
export type { IUser };
