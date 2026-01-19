import sendEmail from './sendEmail.js';
import { orderConfirmationTemplate } from './emailTemplates.js';

export const sendOrderConfirmation = async (order, user) => {
    try {
        await sendEmail({
            email: user.email,
            name: user.name,
            subject: `Order Confirmed - #${order._id}`,
            html: orderConfirmationTemplate(order, user),
            message: `Your order #${order._id} has been confirmed. Total: ₹${order.totalAmount}`
        });

        console.log('✅ Order confirmation email sent');
    } catch (error) {
        console.error('❌ Failed to send order confirmation:', error);
    }
};
