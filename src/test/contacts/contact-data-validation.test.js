const request = require('supertest');
const { createContact, validContactData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  { field: 'test_number', message: 'wrong data type', test_number: 'sss' },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create contact because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/contacts`)
        .send({
          ...validContactData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`should fail to update contact because ${message}`, async () => {
      const contact = await createContact();
      const response = await request(app)
        .put(`/api/contacts/${contact._id}`)
        .send({
          ...validContactData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`shoud fail to update many contacts because ${message}`, async () => {
      let contact1 = await createContact();
      let contact2 = await createContact();

      const response = await request(app)
        .put('/api/contacts')
        .set('Cookie', cookie)
        .send({
          updateList: [contact1._id, contact2._id],
          ...validContactData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });
  },
);
