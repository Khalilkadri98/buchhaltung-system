const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const fs = require('fs');
const path = require('path');

const client = new DocumentProcessorServiceClient({
  keyFilename: './config/buchhaltung-466111-2d499134e084.json',
});

const PROJECT_ID = 'buchhaltung-466111';
const LOCATION = 'eu';
const PROCESSOR_ID = '1ea21861f773981e';
const FILE_PATH = path.join(__dirname, './assets/sample-invoice.pdf');

async function main() {
  const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const mimeType = 'application/pdf';

  const request = {
    name,
    inlineDocument: {
      content: fileBuffer.toString('base64'),
      mimeType,
    },
  };

  try {
    console.log("📤 Sending request to Document AI...");
    const [result] = await client.processDocument(request);
    const document = result.document;

    console.log("✅ Full document text:\n", document.text);
    console.log("📑 Extracted fields:");
    document.entities?.forEach(entity => {
      console.log(`- ${entity.type}: ${entity.mentionText}`);
    });
  } catch (error) {
    console.error("❌ Document AI Error:", error.message);
  }
}

main();
