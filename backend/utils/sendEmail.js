import getBrevoClient from '../config/email.js';
import SibApiV3Sdk from '@sendinblue/client';

const sendEmail = async (options) => {
    try {
        const apiInstance = getBrevoClient();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        // Sender details
        sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'ATELIER',
            email: process.env.BREVO_SENDER_EMAIL
        };

        // Recipient details
        sendSmtpEmail.to = [
            {
                email: options.email,
                name: options.name || ''
            }
        ];

        // Email content
        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.html || `<p>${options.message}</p>`;
        sendSmtpEmail.textContent = options.message;

        // Send email
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Email sent successfully:', result.body.messageId);

        return { success: true, messageId: result.body.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw new Error('Email could not be sent');
    }
};

// ✅ NEW: Helper functions using templates
import { otpEmailTemplate, orderConfirmationTemplate, welcomeEmailTemplate } from './emailTemplates/index.js';

/**
 * Send OTP Email
 */
export const sendOTPEmail = async (email, name, otp) => {
    const htmlContent = otpEmailTemplate(name, otp);

    return await sendEmail({
        email,
        name,
        subject: '🔐 Password Reset OTP - ATELIER',
        html: htmlContent,
        message: `Your OTP is: ${otp}`
    });
};

/**
 * Send Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async (email, order, user) => {
    const htmlContent = orderConfirmationTemplate(order, user);

    return await sendEmail({
        email,
        name: user.name,
        subject: `🎉 Order Confirmed #${order._id} - ATELIER`,
        html: htmlContent,
        message: `Your order #${order._id} has been confirmed.`
    });
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, name) => {
    const htmlContent = welcomeEmailTemplate(name);

    return await sendEmail({
        email,
        name,
        subject: '👋 Welcome to ATELIER - Your Fashion Journey Begins!',
        html: htmlContent,
        message: `Welcome to ATELIER, ${name}!`
    });
};

export default sendEmail;
