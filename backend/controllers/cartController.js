import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId, quantity, size, color } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock availability
    if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product with same variant (size/color) already in cart
    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId &&
        (item.size || null) === (size || null) &&
        (item.color || null) === (color || null)
    );

    if (itemIndex > -1) {
        // Update quantity (cap at available stock)
        const existing = cart.items[itemIndex];
        const newQty = existing.quantity + quantity;
        cart.items[itemIndex].quantity = Math.min(newQty, product.stock);
    } else {
        // Add new item with variant info
        cart.items.push({
            product: productId,
            quantity: Math.min(quantity, product.stock),
            size: size || null,
            color: color || null,
            price: product.price
        });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        success: true,
        message: 'Product added to cart',
        data: cart
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCart = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId, quantity, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find item in cart matching variant
    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId &&
        (item.size || null) === (size || null) &&
        (item.color || null) === (color || null)
    );

    if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        success: true,
        message: 'Cart updated successfully',
        data: cart
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId } = req.params;

    // size/color may be sent in body (axios delete) or query
    const size = req.body?.size || req.query?.size || null;
    const color = req.body?.color || req.query?.color || null;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => {
        if (item.product.toString() !== productId) return true;
        // If size/color provided, only remove matching variant
        if (size || color) {
            return !(
                (item.size || null) === (size || null) &&
                (item.color || null) === (color || null)
            );
        }
        // no variant provided: remove all matching product entries
        return false;
    });

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        success: true,
        message: 'Product removed from cart',
        data: cart
    });
});

// @desc    Merge guest cart into user cart
// @route   POST /api/cart/merge
// @access  Private
export const mergeCart = asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!items.length) {
        const cart = await Cart.findOne({ user: req.user._id }) || await Cart.create({ user: req.user._id, items: [] });
        await cart.populate('items.product');
        return res.status(200).json({ success: true, data: cart });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Process each guest item and merge into server cart
    // Optimize by loading all referenced products in one query to avoid N+1
    const productIds = Array.from(new Set(items.map(it => it.productId || it.product).filter(Boolean)));
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const it of items) {
        const productId = (it.productId || it.product || '').toString();
        const quantity = parseInt(it.quantity, 10) || 0;
        const size = it.size || null;
        const color = it.color || null;

        if (!productId || quantity <= 0) continue;

        const product = productMap.get(productId);
        if (!product || !product.isActive) continue;

        // Find matching variant in cart
        const idx = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            (item.size || null) === (size || null) &&
            (item.color || null) === (color || null)
        );

        if (idx > -1) {
            // merge quantities, cap at stock
            const existing = cart.items[idx];
            existing.quantity = Math.min(existing.quantity + quantity, product.stock);
        } else {
            cart.items.push({
                product: productId,
                quantity: Math.min(quantity, product.stock),
                size,
                color,
                price: product.price
            });
        }
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ success: true, message: 'Cart merged', data: cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.status(200).json({ success: true, message: 'Cart cleared', data: { items: [] } });
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
});
