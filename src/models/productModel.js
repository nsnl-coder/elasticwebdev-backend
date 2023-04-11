const mongoose = require('mongoose');
const slugify = require('slugify');
const { variantSchema } = require('./variantModel');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: 'unnamed product',
    },
    slug: {
      type: String,
      default: 'unnamed-product',
    },
    status: String,
    overview: String,
    description: String,
    isPinned: Boolean,
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    images: [String],
    previewImages: [String],
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'collection',
      },
    ],
    variants: [variantSchema],
    // side effect
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    // for testing only
    test_string: String,
    test_number: Number,
    test_any: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  },
);

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.pre(/(updateMany|findOneAndUpdate)/, function (next) {
  const payload = this.getUpdate();

  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true });
  }

  next();
});

const Product = mongoose.model('product', productSchema);

module.exports = { productSchema, Product };
