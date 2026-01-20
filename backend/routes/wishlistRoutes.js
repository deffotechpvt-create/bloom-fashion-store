import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  moveAllToCart,
  checkInWishlist
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';
import {
  addToWishlistValidation,
  removeFromWishlistValidation,
  moveToCartValidation
} from '../validations/wishlistValidation.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlistValidation, addToWishlist);
router.delete('/remove/:productId', removeFromWishlistValidation, removeFromWishlist);
router.delete('/clear', clearWishlist);
router.post('/move-to-cart', moveToCartValidation, moveToCart);
router.post('/move-all-to-cart', moveAllToCart);
router.get('/check/:productId', checkInWishlist);

export default router;
