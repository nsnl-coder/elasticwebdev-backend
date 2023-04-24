import { Schema, model } from 'mongoose';
import { IContact } from '../yup/contactSchema';

const contactSchema = new Schema<IContact>(
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

const Contact = model<IContact>('contact', contactSchema);

export { contactSchema, Contact };
