import request from "supertest";;
import { app } from "../../config/app";;
import { createProduct, validProductData } from "../products/utils";;
import { createShipping, validShippingData } from "../shippings/utils";;

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'user' });
  cookie = newCookie;
});

it.only('returns 200 & successfully creates order', async () => {
  const product = await createProduct(validProductData);
  const shipping = await createShipping(validShippingData);

  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      items: [
        {
          product: product._id,
          options: [
            product.variants[0].options[0]._id,
            product.variants[1].options[0]._id,
          ],
          quantity: 3,
        },
        {
          product: product._id,
          options: [product.variants[0].options[0]._id],
          quantity: 2,
        },
      ],
      shippingMethod: shipping._id,
      phone: '5959562588',
      fullname: 'test fullname',
      shippingAddress: '28 rosegarden',
      email: 'test@test.com',
    });
  // .expect(201);

  // expect(body.data).toMatchObject(validOrderData);
});

it.each(['items', 'fullname', 'shippingAddress', 'email', 'phone'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/orders')
      .send({
        // add payload here
        [field]: undefined,
      })
      .set('Cookie', cookie)
      .expect(400);

    // also check if it return correct message
    expect(body.errors.includes(`${field} is required`)).toBe(true);
  },
);

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .post('/api/orders')
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
      .post('/api/orders')
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });
});
