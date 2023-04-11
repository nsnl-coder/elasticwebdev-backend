const { compareAsc } = require('date-fns');
const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
  {
    couponCode: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      default: 'draft',
    },
    discountUnit: {
      type: String,
      enum: ['$', '%'],
    },
    discountAmount: Number,
    isFreeshipping: Boolean,
    minimumOrder: Number,
    maximumOrder: Number,
    couponQuantity: Number,
    usedCoupons: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    endDate: {
      type: Date,
      default: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
    // testing purpose only
    test_string: String,
    test_number: Number,
    test_any: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        delete ret.updatedAt;
      },
    },
  },
);

couponSchema.virtual('zeroCouponsLeft').get(function () {
  let zeroCouponsLeft = false;

  if (this.couponQuantity === this.usedCoupons) {
    zeroCouponsLeft = true;
  }

  return zeroCouponsLeft;
});

couponSchema.virtual('isExpired').get(function () {
  const isExpired = compareAsc(new Date(this.endDate), new Date()) === -1;
  return isExpired;
});

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = { couponSchema, Coupon };
