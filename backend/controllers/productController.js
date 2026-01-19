import Product from '../models/Product.js';
import Image from '../models/Image.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (category) {
        query.category = category;
    }

    if (search) {
        query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
        .populate('createdBy', 'name email')
        .limit(Number(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        data: products
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ success: false, errors: errors.array() });
    // }

    const { name, description, price, category, stock } = req.body;
    let { image, images } = req.body;

    // Handle single image file (Save to MongoDB)
    if (req.files && req.files.image) {
        const file = req.files.image[0];
        const imageDoc = await Image.create({
            name: file.originalname,
            data: file.buffer,
            contentType: file.mimetype,
            size: file.size
        });
        image = `/api/images/${imageDoc._id}`;
    }

    // Handle multiple images files (Save to MongoDB)
    let imagesArray = [];
    if (images) {
        imagesArray = Array.isArray(images) ? images : [images];
    }

    if (req.files && req.files.images) {
        for (const file of req.files.images) {
            const imageDoc = await Image.create({
                name: file.originalname,
                data: file.buffer,
                contentType: file.mimetype,
                size: file.size
            });
            imagesArray.push(`/api/images/${imageDoc._id}`);
        }
    }

    if (!image && imagesArray.length > 0) {
        image = imagesArray[0];
    }

    if (!image) {
        return res.status(400).json({ success: false, message: 'At least one product image is required' });
    }

    const product = await Product.create({
        name,
        description,
        price,
        category,
        image,
        images: imagesArray,
        stock,
        createdBy: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = { ...req.body };

    // Handle single image file (Save to MongoDB)
    if (req.files && req.files.image) {
        const file = req.files.image[0];
        const imageDoc = await Image.create({
            name: file.originalname,
            data: file.buffer,
            contentType: file.mimetype,
            size: file.size
        });
        updateData.image = `/api/images/${imageDoc._id}`;
    }

    // Handle multiple images files (Save to MongoDB)
    if (req.files && req.files.images) {
        const uploadedImages = [];
        for (const file of req.files.images) {
            const imageDoc = await Image.create({
                name: file.originalname,
                data: file.buffer,
                contentType: file.mimetype,
                size: file.size
            });
            uploadedImages.push(`/api/images/${imageDoc._id}`);
        }

        let existingImages = req.body.images || product.images || [];
        if (typeof existingImages === 'string') existingImages = [existingImages];
        updateData.images = [...existingImages, ...uploadedImages];

        // If image wasn't updated but was empty, use the first from images
        if (!updateData.image && !product.image) {
            updateData.image = updateData.images[0];
        }
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
    });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
});
