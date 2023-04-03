const { Variant } = require('../../models/variantModel');

const validVariantData = {
  name: 'test variant name',
  options: [
    {
      optionName: 'test option1',
      photo: 'photo-1',
    },
    {
      optionName: 'test option2',
      photo: 'photo-2',
    },
  ],
};

const createVariant = async (data) => {
  const variant = await Variant.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(variant));
};

module.exports = { createVariant, validVariantData };
