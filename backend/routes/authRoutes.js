import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    logout,
    setupAdmin,
    requestPromotion,
    verifyPromotion
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);
router.post('/setup-admin', setupAdmin);
router.post('/request-promotion', protect, authorize('admin'), requestPromotion);
router.post('/verify-promotion', protect, authorize('admin'), verifyPromotion);

export default router;
