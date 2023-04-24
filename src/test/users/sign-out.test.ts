import request from "supertest";;
import { app } from "../../config/app";;

it('successfully signs out', async () => {
  await signup();

  const response = await request(app).post('/api/auth/sign-out').expect(200);

  // check if response message is correct
  const cookie = response.get('Set-Cookie');
  expect(cookie).toEqual(['jwt=; Path=/']);
});
