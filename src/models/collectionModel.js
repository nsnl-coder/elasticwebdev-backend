const mongoose = require('mongoose');
const slugify = require('slugify');

const collectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: 'unnamed collection',
    },
    photo: String,
    isPinned: Boolean,
    description: String,
    status: {
      type: String,
      enum: ['draft', 'active'],
      default: 'draft',
    },
    slug: String,
    // testing purpose only
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

collectionSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

collectionSchema.pre(/(updateMany|findOneAndUpdate)/, function (next) {
  const payload = this.getUpdate();

  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true });
  }

  next();
});

const Collection = mongoose.model('collection', collectionSchema);

module.exports = { collectionSchema, Collection };
