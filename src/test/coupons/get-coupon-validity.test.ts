import request from 'supertest';
import { app } from '../../config/app';
import { createCoupon, validCouponData } from './utils';

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
      discountInPercent: 25,
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
      discountInPercent: 12.5,
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
      'Cannot find coupon with provided coupon code',
    );
  });

  it('should be invalid if coupon end date is over', async () => {
    const coupon = await createCoupon({
      ...validCouponData,
      startDate: new Date(Date.now() - 10 * 60 * 1000),
      endDate: new Date(Date.now() - 8 * 60 * 1000),
    });

    const response = await request(app)
      .post('/api/coupons/get-coupon-validity')
      .send({
        couponCode: coupon.couponCode,
        orderTotal: 100,
      })
      .expect(400);

    expect(response.body.message).toEqual('Your coupon code is expired');
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

    expect(response.body.message).toEqual('All coupons have been used');
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
      'Add more items to your cart to get a discount of $100',
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
      'Your order must be at least $60 to use this coupon',
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
      'Your order cannot exceed $999 to use this coupon',
    );
  });
});
