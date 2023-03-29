const yup = require('yup');
const objectIdSchema = require('./objectIdSchema');

const productSchema = yup.object({
  body: yup.object({
    title: yup.string().required(),
    isPinned: yup.boolean(),
    costPerItem: yup.number().min(0).max(999999),
    price: yup.number().min(0).max(999999),
    discountPrice: yup.number().min(0).max(999999),
    inventory: yup.number().min(0).max(999999),
    visibility: yup.string().oneOf(['draft', 'active', 'archived']),
  }),
  params: yup.object({
    id: objectIdSchema,
    deleteList: yup.array().of(objectIdSchema),
    updateList: yup.array().of(objectIdSchema),
  }),
});

module.exports = productSchema;
