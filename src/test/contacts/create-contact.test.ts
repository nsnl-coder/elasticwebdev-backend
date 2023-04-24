import request from "supertest";;
import { app } from "../../config/app";;
import { validContactData } from "./utils";;

let cookie = '';

it('returns 200 & successfully creates contact', async () => {
  const { body } = await request(app)
    .post('/api/contacts')
    .set('Cookie', cookie)
    .send({
      ...validContactData,
    })
    .expect(201);

  expect(body.data).toMatchObject(validContactData);
});

it.each(['email', 'fullname', 'phone', 'subject', 'content'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/contacts')
      .send({
        // add payload here
        [field]: undefined,
      })
      .set('Cookie', cookie)
      .expect(400);

    // also check if it return correct message
    expect(body.errors).toContain(`${field} is required`);
  },
);
