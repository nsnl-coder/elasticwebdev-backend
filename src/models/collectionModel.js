const mongoose = require('mongoose');
const slugify = require('slugify');

const collectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: 'untitled collection',
    },
    photo: String,
    isPinned: Boolean,
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
  },
);

collectionSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Collection = mongoose.model('collection', collectionSchema);

module.exports = { collectionSchema, Collection };
