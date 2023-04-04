const { Rating } = require('../../models/ratingModel');

const { createProduct } = require('../products/utils');

const validRatingData = {
  stars: 5,
  content: 'test content',
};

const createRating = async (data) => {
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

module.exports = { createRating, validRatingData };
