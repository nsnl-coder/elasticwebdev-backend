const request = require('supertest');
const { app } = require('../../config/app');

describe('success case', () => {
  it('should update phone number', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .set('Cookie', cookie)
      .send({
        phone: '28795955555',
      })
      .expect(200);

    expect(body.data.phone).toBe('28795955555');

    // it does not change fullname
    expect(body.data.fullname).toBe('test name');
  });

  it('should update fullname', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .set('Cookie', cookie)
      .send({
        fullname: 'New Fullname',
      })
      .expect(200);

    expect(body.data.fullname).toBe('new fullname');
  });

  it('should update shipping address', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .set('Cookie', cookie)
      .send({
        shippingAddress: '1500 Barton Street',
      })
      .expect(200);

    expect(body.data.shippingAddress).toBe('1500 Barton Street');

    // it does not change fullname
    expect(body.data.fullname).toBe('test name');
  });
});

describe('auth check', () => {
  it('returns 401 if user is not logged in', async () => {
    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .send({
        fullname: 'New Fullname',
      })
      .expect(401);

    // it returns correct error message
    expect(body.message).toBe(
      'You are not logged in! Please logged in to perform the action',
    );
  });

  it('returns 400 if user wants to update password', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .set('Cookie', cookie)
      .send({
        password: 'newpassword',
      })
      .expect(400);

    // it returns correct error message
    expect(body.message).toBe(
      'Please use /api/users/update-password route to update password',
    );
  });

  it('should return error if user wants to update email', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .set('Cookie', cookie)
      .send({
        email: 'test2@test.com',
      })
      .expect(400);

    // it returns correct error message
    expect(body.message).toBe(
      'Please use /api/users/update-email route to update email',
    );
  });
});

describe('data validation failed', () => {
  it('should return error if phone number is not valid', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .set('Cookie', cookie)
      .send({
        phone: '287955',
      })
      .expect(400);

    expect(body.message).toBe('Data validation failed');
    expect(body.errors.includes('Please provide valid phone number')).toBe(
      true,
    );
  });

  it('should return error if fullname is not valid', async () => {
    const { cookie } = await signup();

    const { body } = await request(app)
      .put('/api/users/update-user-info')
      .set('Cookie', cookie)
      .send({
        fullname: '22',
      })
      .expect(400);

    expect(body.message).toBe('Data validation failed');
    expect(
      body.errors.includes('body.fullname must be at least 6 characters'),
    ).toBe(true);
  });
});
