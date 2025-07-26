const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  uploadCertificate, 
  getUserCertificates, 
  getClassCertificates, 
  updateCertificateStatus,
  deleteCertificate,
  getPointsSummary
} = require('../controllers/certificateController');
const { protect, teacher, teacherOnly } = require('../middleware/authMiddleware');

// Debug log to verify controller functions
console.log('Controller functions loaded:', {
  uploadCertificate: typeof uploadCertificate,
  getUserCertificates: typeof getUserCertificates,
  getClassCertificates: typeof getClassCertificates,
  updateCertificateStatus: typeof updateCertificateStatus,
  deleteCertificate: typeof deleteCertificate,
  getPointsSummary: typeof getPointsSummary
});

// Set up multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    console.log('Upload destination path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const filename = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images or PDFs only!');
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.post('/', protect, upload.single('certificate'), uploadCertificate);
router.get('/', protect, getUserCertificates);
router.get('/summary', protect, getPointsSummary);
router.get('/class/:className', protect, teacherOnly, getClassCertificates);
router.put('/:id', protect, teacherOnly, updateCertificateStatus);
router.delete('/:id', protect, deleteCertificate);

module.exports = router;