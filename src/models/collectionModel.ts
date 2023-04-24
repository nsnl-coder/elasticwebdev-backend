import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { ICollection } from '../yup/collectionSchema';

const collectionSchema = new Schema<ICollection>(
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
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }

  next();
});

collectionSchema.pre(/(updateMany|findOneAndUpdate)/, function (next) {
  const payload = this.getUpdate() as ICollection;

  if (payload && payload.name) {
    payload.slug = slugify(payload.name, { lower: true });
  }

  next();
});

const Collection = model<ICollection>('collection', collectionSchema);

export { collectionSchema, Collection };
