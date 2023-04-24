import { Variant } from '../../models/variantModel';
import { IVariant } from '../../yup/variantSchema';
const validVariantData: Partial<IVariant> = {
  variantName: 'test variant name',
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

const createVariant = async (data?: Partial<IVariant>): Promise<IVariant> => {
  const variant = await Variant.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(variant));
};

export { createVariant, validVariantData };
