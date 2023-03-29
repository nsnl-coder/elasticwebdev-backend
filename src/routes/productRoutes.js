const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

router.post('/', productController.createProduct);

router.get('/:id', productController.getProduct);
router.get('/', productController.getAllProducts);

// only admin can do it from here
router.put(':id', productController.updateProduct);
router.put('/', productController.updateManyProducts);
router.delete(':id', productController.deleteProduct);
router.delete('/', productController.deleteManyProducts);
router.post('/duplicate/:id', productController.duplicateProduct);

module.exports = router;
