const mongoose = require('mongoose');

const contactSchema = mongoose.Schema(
  {
    email: String,
    fullname: String,
    phone: String,
    subject: String,
    content: String,
    isRead: Boolean,
    adminNotes: String,
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

const Contact = mongoose.model('contact', contactSchema);

module.exports = { contactSchema, Contact };
