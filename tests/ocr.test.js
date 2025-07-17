const request = require('supertest');
const app = require('../server');
const filePath = "C:/myWorkspace/buchhaltung-system/backend/tests/assets/invoice1.png";
const fs = require('fs');

describe('OCR Upload API', () => {
  it('should upload a document and extract text', async () => {
    //const filePath = path.join(__dirname, 'sample-bill.png');
    console.log('🧾 Using file:', filePath);

    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true); // Will fail if file doesn't exist

    const res = await request(app)
      .post('/api/ocr/upload')
      .attach('document', filePath);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('text');
    console.log('✅ Extracted Text:', res.body.text);
  });
});
