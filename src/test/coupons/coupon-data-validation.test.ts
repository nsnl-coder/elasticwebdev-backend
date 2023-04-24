import request from "supertest";;
let { createCoupon, validCouponData } = require('./utils');
import { app } from "../../config/app";;

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'status',
    message: 'Coupon status must be one of the following values: draft, active',
    status: 'invalid',
  },
  {
    field: 'endDate',
    message: 'The end date is required when provided start date!',
    endDate: undefined,
  },
  {
    field: 'startDate',
    message: 'The discount start date can not be in the past!',
    startDate: new Date('2019-01-01'),
  },
  {
    field: 'endDate,startDate',
    message: 'The end date of coupon should be after the start date!',
    endDate: new Date('2050-06-06'),
    startDate: new Date('2060-07-07'),
  },
  {
    field: 'discountUnit',
    message: 'discountUnit must be one of the following values: $, %',
    discountUnit: 'xx',
  },
  {
    field: 'discountAmount',
    message: 'Discount percentage should be less than 100!',
    discountUnit: '%',
    discountAmount: 101,
  },
  {
    field: 'discountAmount',
    message: 'Discount amount in dollar should be less than 9999',
    discountUnit: '$',
    discountAmount: 10000,
  },
  {
    field: 'discountAmount',
    message: 'Discount percentage should be greater than 1!',
    discountUnit: '%',
    discountAmount: -100,
  },
  {
    field: 'minimumOrder',
    message: 'Maximum order is required when specified minimum order!',
    discountUnit: '%',
    minimumOrder: 100,
    maximumOrder: undefined,
  },
  {
    field: 'minimumOrder',
    message: 'Maximum order should be greater than minimum order!',
    discountUnit: '%',
    minimumOrder: 100,
    maximumOrder: 99,
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, _note, ...invalidData }) => {
    it(`shoud fail to create coupon because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/coupons`)
        .send({
          ...validCouponData,
          ...invalidData,
          couponCode: Math.random().toString(20).substring(2, 10),
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`should fail to update coupon because ${message}`, async () => {
      const coupon = await createCoupon();
      const response = await request(app)
        .put(`/api/coupons/${coupon._id}`)
        .send({
          ...validCouponData,
          ...invalidData,
          couponCode: Math.random().toString(20).substring(2, 10),
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`shoud fail to update many coupons because ${message}`, async () => {
      let coupon1 = await createCoupon();
      let coupon2 = await createCoupon();

      const response = await request(app)
        .put('/api/coupons')
        .set('Cookie', cookie)
        .send({
          updateList: [coupon1._id, coupon2._id],
          ...validCouponData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
