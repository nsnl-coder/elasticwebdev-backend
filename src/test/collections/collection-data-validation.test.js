const request = require('supertest');
const { createCollection, validCollectionData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'isPinned',
    message:
      'isPinned must be a `boolean` type, but the final value was: `"dsas"`.',
    isPinned: 'dsas',
  },
  {
    field: 'name',
    name: 'a'.repeat(300),
    message: 'name must be at most 255 characters',
  },
  {
    field: 'photo',
    message: 'photo must be at most 255 characters',
    photo: 'a'.repeat(300),
  },
  {
    field: 'status',
    message: 'status must be one of the following values: draft, active',
    status: 'wrong-status',
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create collection because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/collections`)
        .send({
          ...validCollectionData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`should fail to update collection because ${message}`, async () => {
      const collection = await createCollection();
      const response = await request(app)
        .put(`/api/collections/${collection._id}`)
        .send({
          ...validCollectionData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`shoud fail to update many collections because ${message}`, async () => {
      let collection1 = await createCollection();
      let collection2 = await createCollection();

      const response = await request(app)
        .put('/api/collections')
        .set('Cookie', cookie)
        .send({
          updateList: [collection1._id, collection2._id],
          ...validCollectionData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
