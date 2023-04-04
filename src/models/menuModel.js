const mongoose = require('mongoose');

const menuSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: 'unnamed menu',
    },
    link: String,
    photo: String,
    ordering: Number,
    parentMenu: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
);

const Menu = mongoose.model('menu', menuSchema);

module.exports = { menuSchema, Menu };
