import request from "supertest";;
import { app } from "../../config/app";;
import { createProduct } from "./utils";;

let cookie = '';

// ===================================================

it('returns 200 & successfully receives requested product', async () => {
  const product = await createProduct();
  const response = await request(app)
    .get(`/api/products/${product._id}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(response.body.data._id).toEqual(product._id);
});

it('should return error if objectid is not valid objectid', async () => {
  const response = await request(app)
    .get(`/api/products/12345678900`)
    .set('Cookie', cookie)
    .expect(400);

  expect(response.body.errors).toContain('Invalid ObjectId');
});

it('should return error if objectid is not existed', async () => {
  const response = await request(app)
    .get(`/api/products/507f1f77bcf86cd799439011`)
    .set('Cookie', cookie)
    .expect(404);

  expect(response.body.message).toEqual(
    'Can not find product with provided id',
  );
});
