const request = require('supertest');
const { validUserData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
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
    message: 'invalid email',
    email: 'testtest.com',
    password: '123456789',
  },
  {
    field: 'password',
    message: 'password too short',
    email: 'test@test.com',
    password: '12344',
  },
  {
    field: 'password',
    message: 'password too short',
    email: 'test@test.com',
    password: '1234',
  },
  {
    field: 'fullname',
    message: 'fullname too short',
    email: 'test@test.com',
    password: '123456789',
    fullname: '12345',
  },
  {
    field: 'phone',
    message: 'invalid phone number',
    email: 'test@test.com',
    password: '123456789',
    phone: '123ssss45',
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
          ...validUserData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`should fail to update user because ${message}`, async () => {
      const response = await request(app)
        .put('/api/auth/update-user-info')
        .send({
          ...validUserData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });
  },
);
