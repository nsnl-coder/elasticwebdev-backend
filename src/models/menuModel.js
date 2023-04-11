const mongoose = require('mongoose');

const menuSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: 'unnamed menu',
    },
    status: {
      type: String,
      enum: ['draft', 'active'],
    },
    link: String,
    photo: String,
    ordering: Number,
    position: {
      type: String,
      enum: ['header', 'footer'],
    },
    childMenus: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'menu',
    },
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

const Menu = mongoose.model('menu', menuSchema);

module.exports = { menuSchema, Menu };
