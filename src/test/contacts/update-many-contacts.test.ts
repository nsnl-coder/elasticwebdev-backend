import request from "supertest";;
import { app } from "../../config/app";;
import { createContact, validContactData } from "./utils";;

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

it('returns 200 & successfully update the contacts', async () => {
  let contact1 = await createContact();
  let contact2 = await createContact();

  // update contact
  const id1 = contact1._id;
  const id2 = contact2._id;

  expect(id1).toBeDefined();
  expect(id2).toBeDefined();

  const payload = {
    ...validContactData,
    isRead: true,
    adminNotes: 'Just some note',
  };

  const response = await request(app)
    .put('/api/contacts')
    .set('Cookie', cookie)
    .send({
      updateList: [id1, id2],
      ...payload,
    })
    .expect(200);

  expect(response.body.modifiedCount).toEqual(2);

  // double check
  contact1 = await request(app)
    .get(`/api/contacts/${id1}`)
    .set('Cookie', cookie)
    .expect(200);

  contact2 = await request(app)
    .get(`/api/contacts/${id2}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(contact1.body.data).toMatchObject(payload);
  expect(contact2.body.data).toMatchObject(payload);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .put('/api/contacts')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toBe(
      'You are not logged in! Please logged in to perform the action',
    );
  });

  it('should return error if user is not verified', async () => {
    const { cookie } = await signup({
      isVerified: false,
      email: 'test2@test.com',
    });

    const response = await request(app)
      .put('/api/contacts')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });

  it('should return error if user is not admin', async () => {
    const { cookie } = await signup({
      email: 'test2@test.com',
    });

    const response = await request(app)
      .put('/api/contacts')
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});

it('should return error if updateList contains invalid objectid', async () => {
  const response = await request(app)
    .put('/api/contacts')
    .send({
      updateList: ['id-not-valid', 'invalid-id'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(400);

  expect(response.body.message).toEqual('Data validation failed');
  expect(response.body.errors).toContain('Invalid ObjectId');
});

it('should return error if updateList contains non-existent objectid', async () => {
  const response = await request(app)
    .put('/api/contacts')
    .send({
      updateList: ['507f191e810c19729de860ea', '00000020f51bb4362eee2a4d'],
      test_number: 24,
    })
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual(
    'Can not find contact with provided ids',
  );
});
