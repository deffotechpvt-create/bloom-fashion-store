import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
let dashboardCache = {
    data: null,
    lastUpdated: null
};

const CACHE_TTL = 60 * 1000; // 1 minute


export const getDashboardStats = asyncHandler(async (req, res) => {

    // ---------- CACHE HIT ----------
    if (
        dashboardCache.data &&
        Date.now() - dashboardCache.lastUpdated < CACHE_TTL
    ) {
        return res.status(200).json({
            success: true,
            cached: true,
            data: dashboardCache.data
        });
    }

    // ---------- DATE ----------
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // ---------- PARALLEL QUERIES ----------
    const [
        totalUsers,
        totalProducts,
        totalOrders,
        revenueAgg,
        recentOrders,
        newUsersThisMonth,
        topProducts
    ] = await Promise.all([

        // customers count
        User.countDocuments({ role: "customer" }),

        // fast estimated count
        Product.countDocuments(),

        Order.estimatedDocumentCount(),

        // revenue aggregation
        Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" }
                }
            }
        ]),

        // recent orders (lean = faster)
        Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("_id orderStatus totalAmount paymentStatus createdAt")
            .lean(),

        // new users this month
        User.countDocuments({
            role: "customer",
            createdAt: { $gte: startOfMonth }
        }),

        // top selling products (NO LOOKUP)
        Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalQuantity: { $sum: "$products.quantity" },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$products.price", "$products.quantitys.quantity"]

                        }
                    },
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ])
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const responseData = {
        overview: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            newUsersThisMonth
        },
        recentOrders,
        topProducts
    };

    // ---------- SAVE CACHE ----------
    dashboardCache.data = responseData;
    dashboardCache.lastUpdated = Date.now();

    // ---------- RESPONSE ----------
    res.status(200).json({
        success: true,
        cached: false,
        data: responseData
    });

});



// ==========================================
// ORDER MANAGEMENT
// ==========================================

export const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.userId) filter.user = req.query.userId;

    const orders = await Order.find(filter)
        .populate('user', 'name email phone')
        .populate('products.product', 'image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
        success: true,
        data: orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('products.product', 'name image price');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.json({
        success: true,
        data: order
    });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid order status'
        });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment status'
        });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: order
    });
});

export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    await order.deleteOne();

    res.json({
        success: true,
        message: 'Order deleted successfully'
    });
});

// ==========================================
// USER MANAGEMENT
// ==========================================

export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
        filter.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
        success: true,
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const orderStats = await Order.aggregate([
        { $match: { user: user._id } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$totalAmount' }
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            user,
            stats: orderStats[0] || { totalOrders: 0, totalSpent: 0 }
        }
    });
});


export const toggleUserActive = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
            success: false,
            message: 'You cannot deactivate your own account'
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
            success: false,
            message: 'You cannot delete your own account'
        });
    }

    await user.deleteOne();

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

// ==========================================
// ANALYTICS
// ==========================================

export const getSalesAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const matchFilter = { paymentStatus: 'paid' };
    if (startDate && endDate) {
        matchFilter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const dailySales = await Order.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const categorySales = await Order.aggregate([
        { $match: matchFilter },
        { $unwind: '$products' },
        {
            $lookup: {
                from: 'products',
                localField: 'products.product',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $group: {
                _id: '$productDetails.category',
                revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
                quantity: { $sum: '$products.quantity' }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    res.json({
        success: true,
        data: {
            dailySales,
            categorySales
        }
    });
});
