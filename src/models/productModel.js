const mongoose = require('mongoose');
const { Variant, variantSchema } = require('./variantModel');

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    costPerItem: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price should be less than normal price',
      },
    },
    images: {
      type: [String],
    },
    previewImage: {
      type: String,
    },
    inventory: {
      type: Number,
      default: 999,
    },
    overview: {
      type: String,
    },
    description: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    variants: variantSchema,
  },
  {
    toJSON: {
      // virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        delete ret.id;
      },
    },
    timestamps: true,
  },
);

//  review schema
// productSchema.virtual('reviews', {
//   ref: 'review',
//   localField: '_id',
//   foreignField: 'product',
// });

productSchema.virtual('hahaha').get(() => 'iii');

const productModel = mongoose.model('product', productSchema);

module.exports = productModel;
