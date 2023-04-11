const request = require('supertest');
const { app } = require('../../config/app');
const { createCoupon, validCouponData } = require('./utils');

let cookie = '';

describe('coupon valid', () => {
  it('should be invalid for percentage discount', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      discountUnit: '%',
      discountAmount: 25,
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 200,
      })
      .expect(200);

    expect(response.body.data).toMatchObject({
      couponStatus: 'valid',
      discountInDollar: 50,
      discountInPercentage: 25,
      isFreeshipping: false,
      discountUnit: '%',
    });
  });

  it('should be invalid for amount discount', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      discountUnit: '$',
      discountAmount: 25,
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 200,
      })
      .expect(200);

    expect(response.body.data).toMatchObject({
      couponStatus: 'valid',
      discountInDollar: 25,
      discountInPercentage: 12.5,
      isFreeshipping: false,
      discountUnit: '$',
    });
  });
});

it.each(['couponCode', 'orderTotal'])(
  'return error if %s is missing',
  async (field) => {
    const { body } = await request(app)
      .post('/api/coupons/get-coupon-validity')
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

describe('coupon invalid', () => {
  it('should be invalid if coupon does not exist', async () => {
    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: 'nonexist',
        orderTotal: 100,
      })
      .expect(404);

    expect(response.body.message).toEqual(
      'Can not find coupon with provided coupon code!',
    );
  });

  it('should be invalid if coupon end date is over', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      startDate: Date.now() - 10 * 60 * 1000,
      endDate: Date.now() - 8 * 60 * 1000,
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 100,
      })
      .expect(400);

    expect(response.body.message).toEqual(
      'Your coupon code is expired. Try again with new coupon!',
    );
  });

  it('should be invalid if all coupons has been used', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      couponQuantity: 100,
      usedCoupons: 100,
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 100,
      })
      .expect(400);

    expect(response.body.message).toEqual(
      'All coupons have been in used! Try again with different coupon!',
    );
  });

  it('should be invalid if coupon discount amount is greater than total order', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      discountUnit: '$',
      discountAmount: 100,
      minimumOrder: 0,
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 90,
      })
      .expect(400);

    expect(response.body.message).toEqual(
      'To get the discount, please add more items until your cart total exceeds 100$!',
    );
  });

  it('should be invalid if total order is smaller than required minimum', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      discountUnit: '$',
      discountAmount: 10,
      minimumOrder: 60,
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 40,
      })
      .expect(400);

    expect(response.body.message).toEqual(
      'Your coupon is only valid for order over 60$!',
    );
  });

  it('should be invalid if total order is bigger than required maxium', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      discountUnit: '$',
      discountAmount: 10,
      maximumOrder: 999,
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 1200,
      })
      .expect(400);

    expect(response.body.message).toEqual(
      'Your coupon is only valid for order under 999$!',
    );
  });
});
