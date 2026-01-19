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

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify stock availability
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        if (product.stock < item.quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.name}`
            });
        }
    }

    // Create order
    const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
    }));

    const order = await Order.create({
        user: req.user._id,
        products: orderItems,
        shippingAddress,
        totalAmount: cart.totalAmount
    });
    // Send order confirmation email
    await sendOrderConfirmation(order, req.user);
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

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
        .populate('user', 'name email')
        .populate('products.product')
        .limit(Number(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        data: orders
    });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:orderId/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order is being completed, reduce stock
    if (status === 'delivered' && order.orderStatus !== 'delivered') {
        for (const item of order.products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
});
