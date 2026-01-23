import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

// @desc    Checkout and create order
// @route   POST /api/orders/checkout
// @access  Private
export const checkout = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { shippingAddress } = req.body;
    console.log('Shipping Address:', shippingAddress);

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify stock availability and collect items with real-time prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: `Product ${item.product.name} is no longer available`
            });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.name}`
            });
        }

        // Use real-time price from the database, NOT the cart snapshot
        const currentPrice = product.price;
        subtotal += currentPrice * item.quantity;

        orderItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            price: currentPrice
        });
    }

    const totalWithGST = Math.round(subtotal * 1.18);

    // Create order with SECURELY calculated total
    const order = await Order.create({
        user: req.user._id,
        products: orderItems,
        shippingAddress,
        totalAmount: totalWithGST
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
    });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('products.product')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});
