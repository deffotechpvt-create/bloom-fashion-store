import getBrevoClient from '../config/email.js';
import SibApiV3Sdk from '@sendinblue/client';

const sendEmail = async (options) => {
    try {
        const apiInstance = getBrevoClient();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        // Sender details
        sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'E-Commerce Store',
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

export default sendEmail;
