const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

async function renderPDF(templateId, data) {
    try {
        const templatePath = path.join(__dirname, '..', 'templates', `${templateId}.html`);
        const templateHtml = await fs.readFile(templatePath, 'utf8');

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // Launch headless browser
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Wait for network idle to ensure any fonts/assets are loaded
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5in',
                bottom: '0.5in',
                left: '0.5in',
                right: '0.5in'
            }
        });

        await browser.close();
        return pdfBuffer;

    } catch (error) {
        console.error('Error rendering PDF:', error);
        throw error;
    }
}

module.exports = {
    renderPDF
};
