const express = require('express');
const { generateCoverLetter, generateInterviewQuestions } = require('../services/aiRewriter');

const router = express.Router();

// POST /api/generate/cover-letter
router.post('/cover-letter', async (req, res) => {
    try {
        const { resumeText, jobDescription, companyName, applicantName } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({ error: 'resumeText and jobDescription are required' });
        }

        const coverLetter = await generateCoverLetter(
            resumeText,
            jobDescription,
            companyName || 'the company',
            applicantName || ''
        );

        res.json({ success: true, coverLetter });
    } catch (error) {
        console.error('Cover letter generation error:', error);
        res.status(500).json({ error: 'Cover letter generation failed: ' + error.message });
    }
});

// POST /api/generate/interview-questions
router.post('/interview-questions', async (req, res) => {
    try {
        const { resumeText, jobDescription, jobTitle } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({ error: 'resumeText and jobDescription are required' });
        }

        const questions = await generateInterviewQuestions(resumeText, jobDescription, jobTitle || '');

        res.json({ success: true, questions });
    } catch (error) {
        console.error('Interview questions generation error:', error);
        res.status(500).json({ error: 'Interview questions generation failed: ' + error.message });
    }
});

module.exports = router;
