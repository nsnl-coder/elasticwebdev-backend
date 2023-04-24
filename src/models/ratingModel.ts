import { Schema, model } from 'mongoose';
import { IRating } from '../yup/ratingSchema';

const ratingSchema = new Schema<IRating>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    stars: {
      type: Number,
    },
    content: {
      type: String,
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

const Rating = model<IRating>('rating', ratingSchema);

export { ratingSchema, Rating };
