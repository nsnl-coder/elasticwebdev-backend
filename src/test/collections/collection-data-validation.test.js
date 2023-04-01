const request = require('supertest');
const { createCollection } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

const validData = {};

let invalidData = [
  { isPinned: 'dsas', error: 'of wrong data type' },
  {
    name: 'a'.repeat(300),
    error: 'name length is longer than 255',
  },
  {
    photo: 'a'.repeat(300),
    error: 'photo length is longer than 255',
  },
];

// ==============================================================
invalidData = invalidData.map((item) => [item]);

describe.each(invalidData)('data validation', (invalidData) => {
  it(`shoud fail to create collection because ${invalidData.error}`, async () => {
    const response = await request(app)
      .post(`/api/collections`)
      .send({
        ...invalidData,
      })
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });

  it(`should fail to update collection because ${invalidData.error}`, async () => {
    const collection = await createCollection();
    const response = await request(app)
      .put(`/api/collections/${collection._id}`)
      .send({
        ...validData,
        ...invalidData,
      })
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });

  it(`shoud fail to update many collections because ${invalidData.error}`, async () => {
    let collection1 = await createCollection();
    let collection2 = await createCollection();

    const response = await request(app)
      .put('/api/collections')
      .set('Cookie', cookie)
      .send({
        updateList: [collection1._id, collection2._id],
        ...validData,
        ...invalidData,
      })
      .expect(400);

    expect(response.body.message).toEqual('Data validation failed');
  });
});
