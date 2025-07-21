const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
require("dotenv").config();

// Initialize Document AI client
const client = new DocumentProcessorServiceClient();

const extractInvoiceData = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read file and determine MIME type
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
const mimeType = 'application/pdf'; // or try 'image/png' if using PNG

    console.log("📎 MIME Type:", mimeType);

    // Validate MIME type
    if (
      !mimeType ||
      !["application/pdf", "image/jpeg", "image/png"].includes(mimeType)
    ) {
      return res
        .status(400)
        .json({ error: `Unsupported file type: ${mimeType}` });
    }

    // Validate environment variables
    const { PROJECT_ID, DOCUMENT_AI_LOCATION, DOCUMENT_AI_PROCESSOR_ID } =
      process.env;
    if (!PROJECT_ID || !DOCUMENT_AI_LOCATION || !DOCUMENT_AI_PROCESSOR_ID) {
      throw new Error(
        "❌ Missing required environment variables (PROJECT_ID, LOCATION, PROCESSOR_ID)"
      );
    }

    // Compose request name
const name = `projects/${process.env.PROJECT_ID}/locations/${process.env.DOCUMENT_AI_LOCATION}/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;

    // Create Document AI request
   const request = {
  name: `projects/${process.env.PROJECT_ID}/locations/${process.env.DOCUMENT_AI_LOCATION}/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`,
  rawDocument: {
    content: fileBuffer.toString('base64'),
    mimeType: mimeType, // must be exactly 'application/pdf' or 'image/png'
  },
};


    console.log("📤 Sending request to Document AI...");
    const [result] = await client.processDocument(request);
    const { document } = result;

    // Extract fields
    const fields = {};
    if (document.entities) {
      for (const entity of document.entities) {
        fields[entity.type] = entity.mentionText;
      }
    }

    // Respond with extracted data
    res.status(200).json({
      message: "✅ Document processed successfully",
      fields,
      fullText: document.text,
    });
  } catch (error) {
    console.error("❌ Document AI Error:", error.message);
    res
      .status(500)
      .json({
        error: "Failed to extract invoice data",
        details: error.message,
      });
  }
};

module.exports = { extractInvoiceData };
