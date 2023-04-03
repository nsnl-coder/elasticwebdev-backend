const request = require('supertest');
let { createCoupon, validCouponData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'status',
    message: 'status can only be draft or active',
    status: 'invalid',
  },
  {
    field: 'endDate',
    message: 'endDate is required when startDate is present',
    endDate: undefined,
  },
  {
    field: 'endDate,startDate',
    message: 'endDate should be after startDate',
    endDate: new Date('2050-06-06'),
    startDate: new Date('2060-07-07'),
  },
  {
    field: 'discountUnit',
    message: 'discountUnit should be $ or %',
    discountUnit: 'xx',
  },
  {
    field: 'discountAmount',
    message: 'discountAmount should <100 if unit is %',
    discountUnit: '%',
    discountAmount: 101,
  },
  {
    field: 'discountAmount',
    message: 'discountAmount should <9999 if unit is $',
    discountUnit: '$',
    discountAmount: 10000,
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
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
    });
  },
);
