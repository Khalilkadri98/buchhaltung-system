const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to the database only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB(); // Connect to MongoDB
}

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ocr', require('./routes/uploadRoutes')); // This must exist and be correct


const PORT = process.env.PORT || 5000;

// Export the app for testing purposes
module.exports = app;

// Start the server only if not in test environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
