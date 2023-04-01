const { Variant } = require('../../models/variantModel');

// TODO:
// 3. Handle data validation in updateVariant, updateManyVariants, createVariant (can copy code)
// 4. Handle objectid does not exist in req.body (if has)
// 5. Handle side effect when delete variant, or delete many variants

2512;
const createVariant = async (data) => {
  const variant = await Variant.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(variant));
};

module.exports = { createVariant };

2512;
