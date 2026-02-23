const express = require('express');
const { rewriteBulletPoint, rewriteProfessionalSummary, rewriteFullResume } = require('../services/aiRewriter');

const router = express.Router();

// POST /api/rewrite/bullet - Rewrite a single bullet point
router.post('/bullet', async (req, res) => {
    try {
        const { bulletText, keywords, jobTitle } = req.body;

        if (!bulletText) {
            return res.status(400).json({ error: 'bulletText is required' });
        }

        const result = await rewriteBulletPoint(bulletText, keywords || [], jobTitle || '');

        res.json({ success: true, result });
    } catch (error) {
        console.error('Bullet rewrite error:', error);
        res.status(500).json({ error: 'Rewrite failed: ' + error.message });
    }
});

// POST /api/rewrite/summary - Rewrite professional summary
router.post('/summary', async (req, res) => {
    try {
        const { resumeText, jobDescription, candidateName } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({ error: 'resumeText and jobDescription are required' });
        }

        const summary = await rewriteProfessionalSummary(resumeText, jobDescription, candidateName || '');

        res.json({ success: true, summary });
    } catch (error) {
        console.error('Summary rewrite error:', error);
        res.status(500).json({ error: 'Summary rewrite failed: ' + error.message });
    }
});

// POST /api/rewrite/full - Full resume optimization
router.post('/full', async (req, res) => {
    try {
        const { resumeText, jobDescription, structured } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({ error: 'resumeText and jobDescription are required' });
        }

        const result = await rewriteFullResume(resumeText, jobDescription, structured || {});

        res.json({ success: true, result });
    } catch (error) {
        console.error('Full rewrite error:', error);
        res.status(500).json({ error: 'Full rewrite failed: ' + error.message });
    }
});

module.exports = router;
