import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name description price image stock category isActive'
    })
    .sort({ 'items.addedAt': -1 });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  // Filter out inactive products
  wishlist.items = wishlist.items.filter(item => item.product && item.product.isActive);
  const productIds = wishlist.items
    .map(item => item.product._id)
    .filter(Boolean); // Remove any null/undefined values
  res.status(200).json({
    success: true,
    productIds
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { productId } = req.body;

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  // Check if product already in wishlist
  if (wishlist.hasProduct(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Product already in wishlist'
    });
  }

  // Add product to wishlist
  wishlist.items.unshift({
    product: productId,
    addedAt: new Date()
  });

  await wishlist.save();
  await wishlist.populate({
    path: 'items.product',
    select: 'name description price image stock category'
  });

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    data: wishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return res.status(404).json({ success: false, message: 'Wishlist not found' });
  }

  // Remove product from wishlist
  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(
    item => item.product.toString() !== productId
  );

  if (wishlist.items.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: 'Product not in wishlist'
    });
  }

  await wishlist.save();
  await wishlist.populate({
    path: 'items.product',
    select: 'name description price image stock category'
  });

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    data: wishlist
  });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.status(404).json({ success: false, message: 'Wishlist not found' });
  }

  wishlist.items = [];
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared successfully',
    data: wishlist
  });
});

// @desc    Move product from wishlist to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
export const moveToCart = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { productId, quantity = 1 } = req.body;

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Check stock
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: 'Insufficient stock' });
  }

  // Find wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist || !wishlist.hasProduct(productId)) {
    return res.status(404).json({
      success: false,
      message: 'Product not in wishlist'
    });
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if product already in cart
  const cartItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (cartItemIndex > -1) {
    cart.items[cartItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price
    });
  }

  // Remove from wishlist
  wishlist.items = wishlist.items.filter(
    item => item.product.toString() !== productId
  );

  // Save both
  await Promise.all([cart.save(), wishlist.save()]);

  await cart.populate('items.product');
  await wishlist.populate({
    path: 'items.product',
    select: 'name description price image stock category'
  });

  res.status(200).json({
    success: true,
    message: 'Product moved to cart',
    data: {
      cart,
      wishlist
    }
  });
});

// @desc    Move all wishlist items to cart
// @route   POST /api/wishlist/move-all-to-cart
// @access  Private
export const moveAllToCart = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');

  if (!wishlist || wishlist.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Wishlist is empty'
    });
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const errors = [];
  const movedProducts = [];

  for (const wishlistItem of wishlist.items) {
    const product = wishlistItem.product;

    // Skip if product not active or out of stock
    if (!product.isActive || product.stock < 1) {
      errors.push(`${product.name} is unavailable`);
      continue;
    }

    // Check if already in cart
    const cartItemIndex = cart.items.findIndex(
      item => item.product.toString() === product._id.toString()
    );

    if (cartItemIndex > -1) {
      cart.items[cartItemIndex].quantity += 1;
    } else {
      cart.items.push({
        product: product._id,
        quantity: 1,
        price: product.price
      });
    }

    movedProducts.push(product.name);
  }

  // Clear wishlist
  wishlist.items = [];

  await Promise.all([cart.save(), wishlist.save()]);
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: `${movedProducts.length} product(s) moved to cart`,
    data: {
      cart,
      wishlist,
      movedProducts,
      errors: errors.length > 0 ? errors : null
    }
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  const inWishlist = wishlist ? wishlist.hasProduct(productId) : false;

  res.status(200).json({
    success: true,
    data: {
      inWishlist
    }
  });
});
