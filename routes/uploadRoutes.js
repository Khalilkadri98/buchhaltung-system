const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { extractTextFromImage } = require('../controllers/ocrController');

// Configure multer
const { extractInvoiceData } = require('../controllers/ocrGoogleController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload-google', upload.single('document'), extractInvoiceData);
// Route: POST /api/ocr/upload
router.post('/upload', upload.single('document'), extractTextFromImage);

module.exports = router;
