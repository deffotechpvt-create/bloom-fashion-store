import { body, param } from 'express-validator';

export const addToCartValidation = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ,
    body('size').optional().isString().withMessage('Size must be a string'),
    body('color').optional().isString().withMessage('Color must be a string')
];

export const updateCartValidation = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ,
    body('size').optional().isString().withMessage('Size must be a string'),
    body('color').optional().isString().withMessage('Color must be a string')
];

export const removeFromCartValidation = [
    param('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID')
];

export const mergeCartValidation = [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.size').optional().isString(),
    body('items.*.color').optional().isString()
];
