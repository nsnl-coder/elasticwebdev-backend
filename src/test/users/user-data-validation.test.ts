import request from 'supertest';
import { validUserData } from './utils';
import { app } from '../../config/app';
import { signup } from '../setup';

let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({
    role: 'admin',
    email: 'test2@test.com',
  });

  cookie = newCookie;
});

let invalidData = [
  {
    field: 'email',
    message: 'email must be a valid email',
    email: 'testtest.com',
    password: '123456789',
  },
  {
    field: 'password',
    message: 'password must be at least 8 characters',
    password: '1234',
  },
  {
    field: 'fullname',
    message: 'fullname must be at least 6 characters',
    fullname: '12345',
  },
  {
    field: 'phone',
    message: 'Please provide valid phone number',
    phone: '123ssss45',
  },
  {
    field: 'profileImage',
    message: 'profileImage must be at most 255 characters',
    profileImage: 'a'.repeat(256),
  },
  {
    field: 'isPinned',
    message:
      'isPinned must be a `boolean` type, but the final value was: `"ja"`.',
    isPinned: 'ja',
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create user because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/auth/sign-up`)
        .send({
          email: 'test@test.com',
          password: '123456789',
          ...validUserData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`should fail to update user because ${message}`, async () => {
      const response = await request(app)
        .put('/api/auth/update-user-info')
        .send({
          email: 'test@test.com',
          password: '123456789',
          ...validUserData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
