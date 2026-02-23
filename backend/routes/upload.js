const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractStructuredData } = require('../services/parser');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/upload - Handle resume file upload
router.post('/', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        let rawText = '';

        // Extract text based on file type
        if (mimeType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            rawText = data.text;
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            const dataBuffer = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            rawText = result.value;
        } else if (mimeType === 'text/plain') {
            rawText = fs.readFileSync(filePath, 'utf-8');
        }

        if (!rawText || rawText.trim().length < 50) {
            return res.status(400).json({
                error: 'Could not extract sufficient text from the file. Please ensure it contains readable text.'
            });
        }

        // Parse structured data from the raw text
        const structuredData = extractStructuredData(rawText);

        // Clean up uploaded file after processing
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            rawText: rawText.trim(),
            structured: structuredData,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            wordCount: rawText.split(/\s+/).filter(Boolean).length,
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        // Clean up on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to process file: ' + error.message });
    }
});

module.exports = router;
