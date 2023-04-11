const { Coupon } = require('../../models/couponModel');

const validCouponData = {
  status: 'active',
  discountUnit: '%',
  discountAmount: 25,
  couponQuantity: 999,
  isFreeshipping: false,
  minimumOrder: 100,
  maximumOrder: 1000,
  startDate: new Date('2030-06-06').toISOString(),
  endDate: new Date('2040-06-06').toISOString(),
};

const createCoupon = async (data) => {
  const couponCode = Math.random().toString(20).substring(2, 10);

  const coupon = await Coupon.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    couponCode,
    ...data,
  });

  return JSON.parse(JSON.stringify(coupon));
};

module.exports = { createCoupon, validCouponData };
