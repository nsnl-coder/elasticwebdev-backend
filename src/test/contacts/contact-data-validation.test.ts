import request from "supertest";;
import { createContact, validContactData } from "./utils";;
import { app } from "../../config/app";;

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  { field: 'email', message: 'email must be a valid email', email: 'sss' },
  {
    field: 'fullname',
    message: 'fullname must be at most 255 characters',
    fullname: 's'.repeat(256),
  },
  {
    field: 'phone',
    message: 'Please provide valid phone number',
    phone: '9595ss9599',
  },
  {
    field: 'subject',
    message: 'subject must be at most 100 characters',
    subject: 's'.repeat(101),
  },
  {
    field: 'content',
    message: 'content must be at most 255 characters',
    content: 's'.repeat(256),
  },
  {
    field: 'isRead',
    message: 'isRead must be a `boolean` type, but the final value was: `"s"`.',
    isRead: 's',
  },
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
      expect(response.body.errors).toContain(message);
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
      expect(response.body.errors).toContain(message);
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
      expect(response.body.errors).toContain(message);
    });
  },
);
