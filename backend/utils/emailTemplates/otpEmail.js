import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const otpEmailTemplate = (name, otp) => {
    // Read the HTML template
    const templatePath = path.join(__dirname, 'templates', 'otp.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Replace placeholders
    html = html.replace('{{userName}}', name);
    html = html.replace('{{otpCode}}', otp);
    html = html.replace(/{{currentYear}}/g, new Date().getFullYear());

    return html;
};

export default otpEmailTemplate;
