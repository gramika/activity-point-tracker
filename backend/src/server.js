const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/events', eventRoutes);

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Make uploads folder static - use absolute path and log it for debugging
const uploadsPath = path.join(__dirname, '../uploads');
console.log('Uploads directory path:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Test route to check if files are accessible
app.get('/check-file/:filename', (req, res) => {
  const filePath = path.join(uploadsPath, req.params.filename);
  console.log('Checking file access for:', filePath);
  
  if (fs.existsSync(filePath)) {
    res.send(`File ${req.params.filename} exists and should be accessible at /uploads/${req.params.filename}`);
  } else {
    res.status(404).send(`File ${req.params.filename} not found`);
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 5008;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});