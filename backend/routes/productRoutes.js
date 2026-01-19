import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import upload from '../middleware/upload.js';
import {
    createProductValidation,
    updateProductValidation
} from '../validations/productValidation.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

// Fields for single main image and multiple secondary images
const productImagesUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

router.post('/', protect, authorize('admin'), productImagesUpload, createProductValidation, createProduct);
router.put('/:id', protect, authorize('admin'), productImagesUpload, updateProductValidation, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
