const express = require('express');
const { calculateATSScore } = require('../services/atsScorer');
const { extractKeywordsWithAI, extractKeywordsLocal } = require('../services/keywordExtractor');

const router = express.Router();

// POST /api/analyze - Analyze resume against job description
router.post('/', async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({
                error: 'Both resumeText and jobDescription are required'
            });
        }

        if (resumeText.length < 50) {
            return res.status(400).json({ error: 'Resume text is too short' });
        }

        if (jobDescription.length < 50) {
            return res.status(400).json({ error: 'Job description is too short' });
        }

        // Extract keywords from job description
        let jdKeywords;
        try {
            jdKeywords = await extractKeywordsWithAI(jobDescription);
        } catch (aiError) {
            console.warn('AI keyword extraction failed, using local fallback:', aiError.message);
            jdKeywords = extractKeywordsLocal(jobDescription);
        }

        // Calculate ATS score
        const scoreResult = calculateATSScore(resumeText, jobDescription, jdKeywords);

        res.json({
            success: true,
            score: scoreResult,
            keywords: jdKeywords,
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Analysis failed: ' + error.message });
    }
});

// POST /api/analyze/keywords - Extract keywords from JD only
router.post('/keywords', async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if (!jobDescription) {
            return res.status(400).json({ error: 'jobDescription is required' });
        }

        let keywords;
        try {
            keywords = await extractKeywordsWithAI(jobDescription);
        } catch (aiError) {
            console.warn('AI extraction failed, using local:', aiError.message);
            keywords = extractKeywordsLocal(jobDescription);
        }

        res.json({ success: true, keywords });
    } catch (error) {
        res.status(500).json({ error: 'Keyword extraction failed: ' + error.message });
    }
});

module.exports = router;
