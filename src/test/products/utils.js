const { Product } = require('../../models/productModel');

// TODO:
// 3. Handle data validation in updateProduct, updateManyProducts, createProduct (can copy code)
// 4. Handle objectid does not exist in req.body (if has)
// 5. Handle side effect when delete product, or delete many products

2512;
const createProduct = async (data) => {
  const product = await Product.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(product));
};

module.exports = { createProduct };

2512;
