const Product = require('../models/productModel');

const createProduct = async (req, res, next) => {
  const body = req.body;

  const product = await Product.create(body);

  res.status(200).json({
    data: product,
  });
};
const getProduct = async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findById(id);

  if (!product) {
    return res
      .status(400)
      .json({ message: 'Cant not find product with provided id' });
  }

  res.status(200).json({ data: product });
};
const getAllProducts = async (req, res, next) => {};
const updateProduct = async (req, res, next) => {};
const updateManyProducts = async (req, res, next) => {};
const deleteProduct = async (req, res, next) => {};
const deleteManyProducts = async (req, res, next) => {};
const duplicateProduct = async (req, res, next) => {};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  updateManyProducts,
  deleteProduct,
  deleteManyProducts,
  duplicateProduct,
};
