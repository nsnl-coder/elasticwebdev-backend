const request = require('supertest');
const { createVariant } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

const validData = {
  name: 'size',
  options: [{ optionName: 'xl' }],
};

let invalidData = [
  {
    options: {},
    error: 'option should be an array',
  },
  {
    options: [{}],
    error: 'option should contain optionName',
  },
];

// ==============================================================
invalidData = invalidData.map((item) => [item]);

describe.each(invalidData)('data validation', (invalidData) => {
  it(`shoud fail to create variant because ${invalidData.error}`, async () => {
    const response = await request(app)
      .post(`/api/variants`)
      .send({
        ...validData,
        ...invalidData,
      })
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });

  it(`should fail to update variant because ${invalidData.error}`, async () => {
    const variant = await createVariant();
    const response = await request(app)
      .put(`/api/variants/${variant._id}`)
      .send({
        ...validData,
        ...invalidData,
      })
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });

  it(`shoud fail to update many variants because ${invalidData.error}`, async () => {
    let variant1 = await createVariant();
    let variant2 = await createVariant();

    const response = await request(app)
      .put('/api/variants')
      .set('Cookie', cookie)
      .send({
        updateList: [variant1._id, variant2._id],
        ...validData,
        ...invalidData,
      })
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });
});
