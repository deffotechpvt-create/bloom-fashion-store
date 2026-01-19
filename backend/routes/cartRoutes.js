import express from 'express';
import {
    getCart,
    addToCart,
    updateCart,
    removeFromCart,
    mergeCart,
    clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import {
    addToCartValidation,
    updateCartValidation,
    removeFromCartValidation
} from '../validations/cartValidation.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCartValidation, addToCart);
router.put('/update', protect, updateCartValidation, updateCart);
router.delete('/remove/:productId', protect, removeFromCartValidation, removeFromCart);
router.post('/merge', protect, mergeCart);
router.delete('/clear', protect, clearCart);

export default router;
