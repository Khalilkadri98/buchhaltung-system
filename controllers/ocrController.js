const vision = require('@google-cloud/vision');
const fs = require('fs');
const Invoice = require('../models/Invoice');

const client = new vision.ImageAnnotatorClient();

// Helper function to extract data from raw text
function extractInvoiceFields(text) {
  const extract = (pattern) => {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  };

  return {
    invoiceNumber: extract(/INVOICE\s*#\s*(\S+)/i),
    invoiceDate: extract(/INVOICE DATE\s*(\d{2}\/\d{2}\/\d{4})/i),
    dueDate: extract(/DUE DATE\s*(\d{2}\/\d{2}\/\d{4})/i),
    totalAmount: extract(/TOTAL\s*\$?(\d+\.\d{2})/i),
    vendorName: extract(/(?:INVOICE\s*\n)?(.+?)\n\d{4} .+/i),
    vendorAddress: extract(/\n(\d{4} .+?)\n/i),
    billToName: extract(/BILL TO\s*(.+)/i),
    billToAddress: extract(/BILL TO[\s\S]*?\n(.+?)\n/i),
  };
}

// Controller function
exports.extractTextFromImage = async (req, res) => {
  try {
    const filePath = req.file.path;

    // OCR processing
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    const rawText = detections[0]?.description || 'No text found';

    // Extract structured fields
    const parsedData = extractInvoiceFields(rawText);

    // Save to MongoDB
    const invoice = new Invoice({
      rawText,
      ...parsedData,
    });

    await invoice.save();

    // Remove uploaded file
    fs.unlinkSync(filePath);

    res.json({
      msg: 'Text extracted and saved successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('OCR Error:', error.message);
    res.status(500).json({ msg: 'Failed to extract and save data' });
  }
};
