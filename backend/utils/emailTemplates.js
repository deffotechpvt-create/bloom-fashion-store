// Helper function to format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// OTP Email Template
export const otpEmailTemplate = (name, otp) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; color: #856404; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Use the OTP below to complete the process:</p>
      
      <div class="otp-box">
        <p style="margin: 0; color: #6c757d; font-size: 14px;">Your OTP Code</p>
        <div class="otp-code">${otp}</div>
        <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">Valid for 10 minutes</p>
      </div>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support if you have concerns.
      </div>

      <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
        This OTP will expire in 10 minutes for security reasons.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} E-Commerce Store. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Order Confirmation Email Template
export const orderConfirmationTemplate = (order, user) => {
    const productsHTML = order.products.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .order-box { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
    .total-amount { font-size: 36px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #667eea; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
      <p>Thank you for your purchase</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${user.name}</strong>,</p>
      
      <p>Your order has been confirmed and is being processed. We'll send you an update when it ships.</p>
      
      <div class="order-box">
        <div style="font-size: 18px;">Order Total</div>
        <div class="total-amount">₹${order.totalAmount.toLocaleString('en-IN')}</div>
        <div style="font-size: 14px;">Order ID: ${order._id}</div>
      </div>
      
      <h3 style="color: #667eea;">Order Details</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
        </tbody>
      </table>
      
      <h3 style="color: #667eea;">Shipping Address</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
        <p style="margin: 5px 0;">${order.shippingAddress.street}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.pincode}, ${order.shippingAddress.country}</p>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Expected delivery: 5-7 business days
      </p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} E-Commerce Store. All rights reserved.</p>
      <p>Need help? Contact us at support@ecommerce.com</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Welcome Email Template
export const welcomeEmailTemplate = (name) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .feature-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👋 Welcome to E-Commerce Store!</h1>
    </div>
    
    <div class="content">
      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Welcome to our store! We're thrilled to have you as part of our community.</p>
      
      <div class="feature-box">
        <h3 style="margin-top: 0;">🎁 What's Next?</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Browse our wide selection of products</li>
          <li>Add items to your cart</li>
          <li>Enjoy secure checkout</li>
          <li>Track your orders easily</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}" class="button">Start Shopping</a>
      </div>
      
      <p style="margin-top: 30px;">Happy shopping!</p>
      <p><strong>The E-Commerce Team</strong></p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} E-Commerce Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};
