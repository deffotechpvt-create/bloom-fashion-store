import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const welcomeEmailTemplate = (name) => {
    // Read the HTML template
    const templatePath = path.join(__dirname, 'templates', 'welcome.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Shop URL
    const shopUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';

    // Replace placeholders
    html = html.replace(/{{userName}}/g, name);
    html = html.replace('{{shopUrl}}', `${shopUrl}/products`);
    html = html.replace(/{{currentYear}}/g, new Date().getFullYear());

    return html;
};

export default welcomeEmailTemplate;
