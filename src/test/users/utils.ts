import { IUser } from '../../yup/userSchema';

const validUserData: Partial<IUser> = {
  isPinned: true,
  fullname: 'test name',
  phone: '499598999',
  profileImage: 'some-image-link',
};

export { validUserData };
