import express from 'express';
import {
    checkout,
    getMyOrders,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { checkoutValidation } from '../validations/orderValidation.js';

const router = express.Router();

router.post('/checkout', protect, checkoutValidation, checkout);
router.get('/my-orders', protect, getMyOrders);

export default router;
