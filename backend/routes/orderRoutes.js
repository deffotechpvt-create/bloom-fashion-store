import express from 'express';
import {
    checkout,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { checkoutValidation } from '../validations/orderValidation.js';

const router = express.Router();

router.post('/checkout', protect, checkoutValidation, checkout);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:orderId/status', protect, authorize('admin'), updateOrderStatus);

export default router;
