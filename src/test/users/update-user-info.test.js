const request = require('supertest');
const { app } = require('../../config/app');
const { validUserData } = require('./utils');

describe('success case', () => {
  it('should update shipping address', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/auth/update-user-info')
      .set('Cookie', cookie)
      .send(validUserData)
      .expect(200);

    // it does not change fullname
    expect(body.data).toMatchObject(validUserData);
  });
});

describe('auth check', () => {
  it('returns 401 if user is not logged in', async () => {
    const { body } = await request(app)
      .put('/api/auth/update-user-info')
      .send({
        fullname: 'New Fullname',
      })
      .expect(401);

    // it returns correct error message
    expect(body.message).toBe(
      'You are not logged in! Please logged in to perform the action',
    );
  });
});

describe('bad request', () => {
  it('should not update user role', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/auth/update-user-info')
      .set('Cookie', cookie)
      .send({
        role: 'admin',
      })
      .expect(200);

    // it returns correct error message
    expect(body.data.role).toBeUndefined();
  });

  it('returns 400 if user wants to update password', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/auth/update-user-info')
      .set('Cookie', cookie)
      .send({
        password: 'newpassword',
      })
      .expect(400);

    // it returns correct error message
    expect(body.message).toBe(
      'Please use /api/auth/update-password route to update password',
    );
  });

  it('should return error if user wants to update email', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/auth/update-user-info')
      .set('Cookie', cookie)
      .send({
        email: 'test2@test.com',
      })
      .expect(400);

    // it returns correct error message
    expect(body.message).toBe(
      'Please use /api/auth/update-email route to update email',
    );
  });
});
