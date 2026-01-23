import { body } from 'express-validator';

export const createProductValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['electronics', 'fashion', 'home', 'books', 'sports', 'beauty', 'toys', 'food', 'other'])
        .withMessage('Invalid category'),
    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

export const updateProductValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .optional()
        .isIn(['electronics', 'fashion', 'home', 'books', 'sports', 'beauty', 'toys', 'food', 'other'])
        .withMessage('Invalid category'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];
