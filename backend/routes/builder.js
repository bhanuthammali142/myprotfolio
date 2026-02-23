const express = require('express');
const router = express.Router();
const { optimizeResumeData } = require('../services/aiRewriter');
const { renderPDF } = require('../services/pdfService');

// Get available templates
router.get('/templates', (req, res) => {
    try {
        const templates = [
            { id: 'modern', name: 'Modern', thumbnail: 'https://placehold.co/400x600/f8fafc/0f172a?text=Modern+Template' },
            { id: 'classic', name: 'Classic', thumbnail: 'https://placehold.co/400x600/fdfbf7/1e293b?text=Classic+Template' },
            { id: 'minimal', name: 'Minimal', thumbnail: 'https://placehold.co/400x600/ffffff/334155?text=Minimal+Template' }
        ];
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch templates' });
    }
});

// Generate optimized resume via AI
router.post('/generate-optimized-resume', async (req, res) => {
    try {
        const { resumeData, jobDescription, templateId } = req.body;

        if (!resumeData || !jobDescription) {
            return res.status(400).json({ success: false, error: 'Resume data and job description are required' });
        }

        const optimizedData = await optimizeResumeData(resumeData, jobDescription, true);

        res.json({ success: true, optimizedData });
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate optimized resume' });
    }
});

// Render the PDF
router.post('/render-pdf', async (req, res) => {
    try {
        const { templateId, optimizedData } = req.body;

        if (!templateId || !optimizedData) {
            return res.status(400).json({ success: false, error: 'Template ID and optimized data are required' });
        }

        const pdfBuffer = await renderPDF(templateId, optimizedData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="optimized_resume_${templateId}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF rendering error:', error);
        res.status(500).json({ success: false, error: 'Failed to render PDF' });
    }
});

module.exports = router;
