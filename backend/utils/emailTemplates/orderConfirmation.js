import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const orderConfirmationTemplate = (order, user) => {
  // Read the HTML template
  const templatePath = path.join(__dirname, 'templates', 'orderConfirmation.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  // ✅ Generate product rows (matching your schema)
  const productRows = order.products.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a2a;">
        <div style="font-weight: 500; color: #f2f2f2; margin-bottom: 4px;">${item.name || 'Product'}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; text-align: center; color: #d1d1d1;">×${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; text-align: right; font-weight: 600; color: #14b8a6;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  // Payment status color and text
  const paymentStatusColor = order.paymentStatus === 'paid' ? '#14b8a6' : '#fbbf24';
  const paymentStatusText = order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending';

  // Replace all placeholders
  html = html.replace(/{{userName}}/g, user.name);
  html = html.replace('{{orderId}}', order._id);
  html = html.replace(/{{totalAmount}}/g, order.totalAmount.toLocaleString('en-IN'));
  html = html.replace('{{paymentStatus}}', paymentStatusText);
  html = html.replace('{{paymentStatusColor}}', paymentStatusColor);
  html = html.replace('{{productRows}}', productRows);
  html = html.replace('{{street}}', order.shippingAddress.street);
  html = html.replace('{{city}}', order.shippingAddress.city);
  html = html.replace('{{state}}', order.shippingAddress.state);
  html = html.replace('{{pincode}}', order.shippingAddress.pincode);
  html = html.replace('{{country}}', order.shippingAddress.country);
  html = html.replace('{{phoneNumber}}', order.shippingAddress.phone);
  html = html.replace(/{{currentYear}}/g, new Date().getFullYear());

  return html;
};

export default orderConfirmationTemplate;
