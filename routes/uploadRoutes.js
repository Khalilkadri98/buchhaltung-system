const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { extractTextFromImage } = require('../controllers/ocrController');

// Configure multer
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/ocr/upload
router.post('/upload', upload.single('document'), extractTextFromImage);

module.exports = router;
