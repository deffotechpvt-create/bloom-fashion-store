import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import razorpayInstance from '../config/razorpay.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendOrderConfirmationEmail } from '../utils/sendEmail.js';


// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    // Create Razorpay order
    const options = {
        amount: Math.round(order.totalAmount * 100), // Amount in paise
        currency: 'INR',
        receipt: `order_${order._id}`,
        payment_capture: 1
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
        success: true,
        data: {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        }
    });
});


// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify-payment
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // ✅ Find order and populate product details
    const order = await Order.findById(orderId).populate('products.product');

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify signature
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    if (generatedSignature !== razorpaySignature) {
        order.paymentStatus = 'failed';
        await order.save();
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update order
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    order.paymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // ✅ Reduce stock and update product names in order
    for (let i = 0; i < order.products.length; i++) {
        const item = order.products[i];
        const product = await Product.findById(item.product);

        if (product) {
            // Reduce stock
            product.stock -= item.quantity;
            await product.save();

            // ✅ Update product name in order if not already set
            if (!item.name) {
                order.products[i].name = product.name;
            }
        }
    }

    await order.save();

    // ✅ Get user details for email
    const user = await User.findById(req.user._id);

    // ✅ Send confirmation email (async - don't block response)
    sendOrderConfirmationEmail(user.email, order, user)
        .then(() => console.log('✅ Order confirmation email sent to:', user.email))
        .catch(err => console.error('❌ Failed to send order confirmation:', err));

    res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: order
    });
});
