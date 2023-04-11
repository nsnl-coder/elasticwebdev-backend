const { Product } = require('../../models/productModel');

// TODO:
// 3. Handle data validation in updateProduct, updateManyProducts, createProduct (can copy code)
// 4. Handle objectid does not exist in req.body (if has)
// 5. Handle side effect when delete product, or delete many products

const validProductData = {
  name: 'test product name',
  status: 'active',
  overview: 'this is test overview',
  description: 'this is test description',
  isPinned: true,
  price: 24,
  discountPrice: 12,
  images: ['some-link', 'few-link'],
  previewImages: ['link', 'link2'],
  variants: [
    {
      variantName: 'size',
      options: [
        { optionName: 'xs', price: 36, photo: 'xs size photo' },
        { optionName: 'sm', price: 14, photo: 'sm size photo' },
        { optionName: 'xl', price: 14, photo: 'xl size photo' },
        { optionName: 'xxl', price: 24, photo: 'xxl size photo' },
      ],
    },
    {
      variantName: 'color',
      options: [
        { optionName: 'red', price: 30, photo: 'red color photo' },
        { optionName: 'green', price: 28, photo: 'green color photo' },
        { optionName: 'black', price: 28, photo: 'black color photo' },
      ],
    },
  ],
};

const createProduct = async (data) => {
  const product = await Product.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(product));
};

module.exports = { createProduct, validProductData };

2512;
