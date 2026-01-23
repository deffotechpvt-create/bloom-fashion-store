import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import generateOTP from '../utils/generateOTP.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/sendEmail.js';
import { validationResult } from 'express-validator';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user with default customer role
    const user = await User.create({
        name,
        email,
        password,
        phone,
        address,
        role: 'customer' // NEVER accept role from request
    });
    try {
        sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const existsUser = await User.findOne({ email });
    if (!existsUser) {
        return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid Password' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    // ✅ SEND ONLY NECESSARY FIELDS
    const safeUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    res.status(200).json({
        success: true,
        message: 'Login successful',
        user: safeUser,
    });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        user
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
    });
});

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
        await sendOTPEmail(user.email, user.name, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to email successfully'
        });
    } catch (error) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
});


// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successful'
    });
});
// @desc    One-time Admin Setup (initial admin)
// @route   POST /api/auth/setup-admin
// @access  Public (Secret Key required)
export const setupAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, setupKey } = req.body;

    // 1. Check if ANY admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
        return res.status(403).json({ success: false, message: 'Admin already initialized. Use promotion system.' });
    }

    // 2. Verify setup key
    if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
        return res.status(401).json({ success: false, message: 'Invalid Admin Setup Key' });
    }

    await User.create({
        name,
        email,
        password,
        role: 'admin'
    });

    res.status(201).json({
        success: true,
        message: 'Master Admin created successfully'
    });
});

// @desc    Request Promotion (Send OTP to current admin)
// @route   POST /api/auth/request-promotion
// @access  Private (Admin only)
export const requestPromotion = asyncHandler(async (req, res) => {
    const admin = await User.findById(req.user._id);

    // Generate OTP for this specific action
    const otp = generateOTP();
    admin.promotionOTP = otp;
    admin.promotionExpire = Date.now() + 5 * 10 * 1000; // 50 seconds
    await admin.save();

    try {
        await sendEmail({
            email: admin.email,
            name: admin.name,
            subject: '🚨 Admin Promotion 2FA - Bloom Fashion',
            html: otpEmailTemplate(admin.name, otp),
            message: `Your one-time code for promoting a user to Admin is: ${otp}`
        });

        res.status(200).json({
            success: true,
            message: 'Promotion OTP sent to your admin email'
        });
    } catch (error) {
        admin.promotionOTP = undefined;
        admin.promotionExpire = undefined;
        await admin.save();
        return res.status(500).json({ success: false, message: 'OTP could not be sent' });
    }
});

// @desc    Verify and Promote User
// @route   POST /api/auth/verify-promotion
// @access  Private (Admin only)
export const verifyPromotion = asyncHandler(async (req, res) => {
    const { targetUserId, otp } = req.body;

    // 1. Validate Admin's OTP
    const admin = await User.findOne({
        _id: req.user._id,
        promotionOTP: otp,
        promotionExpire: { $gt: Date.now() }
    });

    if (!admin) {
        return res.status(400).json({ success: false, message: 'Invalid or expired promotion OTP' });
    }

    // 2. Find and promote target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    targetUser.role = 'admin';
    await targetUser.save();

    // 3. Clear admin OTP
    admin.promotionOTP = undefined;
    admin.promotionExpire = undefined;
    await admin.save();

    res.status(200).json({
        success: true,
        message: `Successfully promoted ${targetUser.name} to Admin`
    });
});

export const logout = asyncHandler(async (req, res) => {

    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});
