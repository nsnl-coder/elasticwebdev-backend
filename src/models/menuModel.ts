import { Schema, model } from 'mongoose';
import { IMenu } from '../yup/menuSchema';
const menuSchema = new Schema<IMenu>(
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
    menuType: {
      type: String,
      enum: ['root', 'nested'],
      default: 'nested',
    },
    position: {
      type: String,
      enum: ['header', 'footer', ''],
    },
    childMenus: {
      type: [Schema.Types.ObjectId],
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

const Menu = model<IMenu>('menu', menuSchema);

export { menuSchema, Menu };
