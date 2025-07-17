const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  rawText: String,
  invoiceNumber: String,
  invoiceDate: String,
  dueDate: String,
  totalAmount: String,
  vendorName: String,
  vendorAddress: String,
  billToName: String,
  billToAddress: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
