const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    photo: {
      type: String,
    },
    isPinned: {
      type: Boolean,
    },
    visibility: {
      type: String,
      enum: ['draft', 'active'],
      default: 'draft',
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true },
);

categorySchema.pre('validate', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name) + '-' + Date.now();
  }
  next();
});

const categoryModel = mongoose.model('Category', categorySchema);

module.exports = categoryModel;
