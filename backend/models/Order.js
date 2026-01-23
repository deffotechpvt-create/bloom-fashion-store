import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [orderItemSchema],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' },
        phone: { type: String }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentId: String,
    razorpayOrderId: String,
    razorpaySignature: String,
    trackingNumber: String
}, {
    timestamps: true
});

// Index for efficient queries
orderSchema.index({ "products.product": 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
