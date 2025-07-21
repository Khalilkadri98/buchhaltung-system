const vision = require('@google-cloud/vision');
const fs = require('fs');
const Invoice = require('../models/Invoice');

const client = new vision.ImageAnnotatorClient();

// Helper function to extract data from raw text
function extractInvoiceFields(text) {
  const extract = (pattern, flags = 'i') => {
    const match = text.match(new RegExp(pattern, flags));
    return match && match[1] ? match[1].trim() : '';
  };

  const invoiceNumber = extract(/Rechnungsnummer\s*[:\-]?\s*([A-Z0-9\-\/]+)/);
  const invoiceDateStr = extract(/(?:Rechnungsdatum|Datum)\s*[:\-]?\s*(\d{2}\.\d{2}\.\d{4})/);
  const dueDateStr = extract(/Fälligkeitsdatum\s*[:\-]?\s*(\d{2}\.\d{2}\.\d{4})/);

  const totalAmountStr =
    extract(/Rechnungsbetrag\s*[€:]?\s*([0-9.,]+)/) ||
    extract(/Gesamtbetrag inkl\.? USt\s*[€:]?\s*([0-9.,]+)/);

  const vendorBlock = extract(/(Musterfirma\s+GmbH[\s\S]{0,100}?Musterstraße[^\n]+\n\d{5,6} [^\n]+)/);
  const vendorLines = vendorBlock?.split('\n').map(l => l.trim()).filter(Boolean) || [];

  const vendorName = vendorLines[0] || 'Musterfirma GmbH';
  const vendorAddress = vendorLines.slice(1).join(', ');

  const billToBlock = extract(/Rechnungsempfänger\s*\n([\s\S]{0,100}?)\n(?:Musterfirma AG|Rechnung|Datum)/);
  const billToLines = billToBlock?.split('\n').map(l => l.trim()).filter(Boolean) || [];

  return {
    invoiceNumber,
    invoiceDate: invoiceDateStr ? new Date(invoiceDateStr.split('.').reverse().join('-')) : null,
    dueDate: dueDateStr ? new Date(dueDateStr.split('.').reverse().join('-')) : null,
    totalAmount: totalAmountStr ? parseFloat(totalAmountStr.replace('.', '').replace(',', '.')) : null,
    vendorName,
    vendorAddress,
    billToName: billToLines[0] || '',
    billToAddress: billToLines.slice(1).join(', ') || ''
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
