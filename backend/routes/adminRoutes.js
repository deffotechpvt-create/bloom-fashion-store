import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getDashboardStats,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    getAllUsers,
    getUserById,
    toggleUserActive,
    deleteUser,
    getSalesAnalytics
} from '../controllers/adminController.js';
import {
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import {
    requestPromotion,
    verifyPromotion
} from '../controllers/authController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment-status', updatePaymentStatus);
router.delete('/orders/:id', deleteOrder);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/request-promotion', requestPromotion);
router.post('/verify-promotion', verifyPromotion);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);

// Analytics
router.get('/analytics/sales', getSalesAnalytics);

// Products
router.post('/products', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), createProduct);
router.put('/products/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
