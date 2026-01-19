import { body } from 'express-validator';

export const checkoutValidation = [
    body('shippingAddress')
        .notEmpty().withMessage('Shipping address is required'),
    body('shippingAddress.street')
        .notEmpty().withMessage('Street is required'),
    body('shippingAddress.city')
        .notEmpty().withMessage('City is required'),
    body('shippingAddress.state')
        .notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode')
        .notEmpty().withMessage('Pincode is required')
        .matches(/^[0-9]{6}$/).withMessage('Pincode must be 6 digits')
];
