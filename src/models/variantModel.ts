import { Schema, model } from 'mongoose';
import { IVariant } from '../yup/variantSchema';
const variantSchema = new Schema<IVariant>(
  {
    variantName: {
      type: String,
      default: 'default name',
    },
    options: [
      {
        optionName: {
          type: String,
          default: 'unnamed option',
        },
        photo: String,
        price: Number,
      },
    ],
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

const Variant = model<IVariant>('variant', variantSchema);

export { variantSchema, Variant };
