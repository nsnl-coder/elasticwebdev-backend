import { Rating } from '../../models/ratingModel';
import { IRating } from '../../yup/ratingSchema';
import { createProduct } from '../products/utils';

const validRatingData: Partial<IRating> = {
  stars: 5,
  content: 'test content',
};

const createRating = async (data?: Partial<IRating>): Promise<IRating> => {
  const product = await createProduct();

  const rating = await Rating.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
    product: product._id,
    createdBy: '642b8200fc13ae1d48f4cf20',
  });

  return JSON.parse(JSON.stringify(rating));
};

export { createRating, validRatingData };
