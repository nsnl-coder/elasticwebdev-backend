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
    discountUnit: String,
    discountAmount: Number,
    minimumOrder: Number,
    maximumOrder: Number,
    couponQuantity: Number,
    usedCoupons: Number,
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

couponSchema.virtual('isExpired').get(function () {
  return compareAsc(new Date(this.endDate), new Date()) === -1;
});

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = { couponSchema, Coupon };
