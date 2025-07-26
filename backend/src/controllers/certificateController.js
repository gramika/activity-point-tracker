// /backend/src/controllers/certificateController.js
const { getActivityKeyword } = require('../utils/activityUtils');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { calculatePoints } = require('../utils/pointsCalculator');

// Real OCR function that connects to the Python service
const processOCR = async (imagePath) => {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post('http://localhost:5001/process', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('Python service response:', response.data);
    return response.data;
  } catch (error) {
    console.error('OCR Processing Error:', error);
    // If Python service fails, use placeholder data
    return {
      names: ["Sample Name"],
      eventName: "Sample Event",
      organizations: ["Sample Organization"],
      activityHead: "Professional Self Initiatives",
      activityNumber: 8,
      activityLevel: "I",
      pointsAwarded: 10,
      rawText: "Sample OCR text for testing"
    };
  }
};

// Helper function to check if certificate is a duplicate
const isDuplicateCertificate = async (userId, extractedData, fileName) => {
  try {
    // Find certificates for this user
    const userCertificates = await Certificate.find({ user: userId });
    
    if (userCertificates.length === 0) {
      return false; // No certificates yet, can't be a duplicate
    }
    
    // Check for similar file names (optional additional check)
    const similarNameCert = userCertificates.find(cert => {
      // Compare file names without extension and user ID prefix
      const baseName1 = path.basename(fileName, path.extname(fileName));
      const baseName2 = path.basename(cert.fileName, path.extname(cert.fileName));
      
      return baseName1 === baseName2;
    });
    
    if (similarNameCert) {
      // If file names are identical (excluding path/extension), likely a duplicate
      console.log('Duplicate detected by file name match');
      return true;
    }

    // Extract necessary data for comparison
    const newEventName = extractedData.eventName?.toLowerCase() || '';
    const newRawText = extractedData.rawText?.toLowerCase() || '';
    const newActivityType = extractedData.activityHead?.toLowerCase() || '';

    // Check for content similarity with existing certificates
    for (const cert of userCertificates) {
      // Skip certificates that are rejected
      if (cert.status === 'rejected') continue;
      
      // Get existing certificate data
      const existingExtractedData = cert.extractedData || {};
      const existingRawText = existingExtractedData.rawText?.toLowerCase() || '';
      const existingEventName = existingExtractedData.entities?.eventName?.toLowerCase() || cert.activityName?.toLowerCase() || '';
      const existingActivityType = cert.activityType?.toLowerCase() || '';
      
      // Calculate a similarity score between the certificates
      let similarityScore = 0;
      
      // Event name match (high weight)
      if (newEventName && existingEventName && (
          newEventName.includes(existingEventName) || 
          existingEventName.includes(newEventName)
      )) {
        similarityScore += 40;
      }
      
      // Activity type match
      if (newActivityType === existingActivityType) {
        similarityScore += 20;
      }
      
      // Raw text similarity (check for significant text overlap)
      if (newRawText && existingRawText) {
        // Create an array of unique words from each text
        const newWords = new Set(newRawText.split(/\s+/).filter(w => w.length > 3));
        const existingWords = new Set(existingRawText.split(/\s+/).filter(w => w.length > 3));
        
        // Count how many words overlap
        let commonWords = 0;
        newWords.forEach(word => {
          if (existingWords.has(word)) commonWords++;
        });
        
        // Calculate percentage match (based on the smaller set)
        const minSize = Math.min(newWords.size, existingWords.size);
        if (minSize > 0) {
          const textMatchPercentage = (commonWords / minSize) * 100;
          
          // Add to similarity score based on text match percentage
          if (textMatchPercentage > 60) {
            similarityScore += 40;
          } else if (textMatchPercentage > 40) {
            similarityScore += 25;
          }
        }
      }
      
      // If similarity score is high enough, consider it a duplicate
      if (similarityScore >= 60) {
        console.log(`Duplicate detected with similarity score: ${similarityScore}`);
        return true;
      }
    }
    
    // No duplicate found
    return false;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false; // If error occurs, allow upload (fail open)
  }
};

// @desc    Upload a certificate
// @route   POST /api/certificates
// @access  Private
const uploadCertificate = async (req, res) => {
  try {
    console.log('Upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    // Normalize the file path for correct URL construction
    const normalizedPath = req.file.path.replace(/\\/g, '/');
    const fileName = path.basename(normalizedPath);
    
    // Store only the file name, not the full path
    const storedPath = `uploads/${fileName}`;
    
    console.log('Original file path:', req.file.path);
    console.log('Normalized file path:', normalizedPath);
    console.log('Stored path for database:', storedPath);
    
    // Process the image with the enhanced Python service for OCR and NER
    const ocrResult = await processOCR(req.file.path);
    
    // Extract entity information
    const extractedEntities = {
      names: ocrResult.names || [],
      eventName: ocrResult.eventName || "Unknown Event",
      organizations: ocrResult.organizations || [],
      dates: ocrResult.dates || [],
      positions: ocrResult.positions || [],
      prize: ocrResult.prize || null,
      activityHead: ocrResult.activityHead || "Professional Self Initiatives",
      activityNumber: ocrResult.activityNumber || 8,
      activityLevel: ocrResult.activityLevel || "I",
      pointsAwarded: ocrResult.pointsAwarded || 0,
      rawText: ocrResult.rawText // Include raw text directly in extracted entities
    };
    
    // Check if this is a duplicate certificate
    const isDuplicate = await isDuplicateCertificate(
      req.user._id,
      extractedEntities,
      req.file.originalname
    );
    
    if (isDuplicate) {
      // Clean up the uploaded file
      try {
        const filePath = path.join(__dirname, '../../', storedPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted duplicate certificate file: ${filePath}`);
        }
      } catch (err) {
        console.error('Error deleting duplicate file:', err);
      }
      
      return res.status(400).json({ 
        message: 'This certificate appears to be a duplicate of one you have already uploaded.'
      });
    }
    
    // Get point calculation information using our enhanced calculator
    const pointsInfo = await calculatePoints(extractedEntities);
    
    // Create a comprehensive object for activity keyword detection
    const certificateData = {
      fileName: req.file.originalname,
      eventName: extractedEntities.eventName,
      organizations: extractedEntities.organizations,
      rawText: ocrResult.rawText,
      extractedData: {
        rawText: ocrResult.rawText,
        entities: extractedEntities,
        pointsCalculation: pointsInfo
      },
      activityType: pointsInfo.activityType,
      activityName: pointsInfo.activityName
    };
    
    // Get the most appropriate activity name
    const keywordActivityName = getActivityKeyword(certificateData);
    console.log('Detected activity keyword:', keywordActivityName);
    
    // For development, you can set this to true to bypass name verification
    const bypassNameVerification = false;
    
    if (!bypassNameVerification) {
      // Get the user's name parts for matching
      const userName = req.user.name;
      const userNameParts = userName.toLowerCase().split(' ').filter(part => part.length >= 3);
      
      // Log for debugging
      console.log('User name:', userName);
      console.log('User name parts for matching:', userNameParts);
      console.log('Extracted names from certificate:', extractedEntities.names);
      
      // If we have raw text from the OCR, search for the user's name in it
      let nameFoundInRawText = false;
      if (extractedEntities.rawText) {
        const rawTextLower = extractedEntities.rawText.toLowerCase();
        
        // First check if the full name appears in the text
        if (rawTextLower.includes(userName.toLowerCase())) {
          console.log('Full name found in raw text');
          nameFoundInRawText = true;
        } else {
          // Then check for individual name parts (first name, last name, etc.)
          for (const part of userNameParts) {
            if (rawTextLower.includes(part)) {
              console.log(`Name part "${part}" found in raw text`);
              nameFoundInRawText = true;
              break;
            }
          }
        }
      }
      
      // Then check if any extracted name contains the user's name parts
      let nameFoundInExtractedNames = false;
      if (extractedEntities.names && extractedEntities.names.length > 0) {
        nameFoundInExtractedNames = extractedEntities.names.some(name => {
          const extractedNameLower = name.toLowerCase();
          
          // First check for full name match
          if (extractedNameLower.includes(userName.toLowerCase())) {
            console.log(`Full name found in extracted name: "${name}"`);
            return true;
          }
          
          // Then check for individual parts
          for (const part of userNameParts) {
            if (extractedNameLower.includes(part)) {
              console.log(`Name part "${part}" found in extracted name: "${name}"`);
              return true;
            }
          }
          return false;
        });
      }
      
      // Only proceed if the name was found in either the raw text or extracted names
      if (!nameFoundInRawText && !nameFoundInExtractedNames) {
        // Clean up the uploaded file since we're rejecting it
        try {
          const filePath = path.join(__dirname, '../../', storedPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted rejected certificate file: ${filePath}`);
          }
        } catch (err) {
          console.error('Error deleting rejected file:', err);
        }
        
        // Return error response
        return res.status(400).json({ 
          message: 'The name on the certificate does not match your name. Please upload certificates issued to you only.' 
        });
      }
    }
    
    console.log('Creating certificate in database');
    const certificate = await Certificate.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: storedPath,
      activityType: pointsInfo.activityType,
      activityName: keywordActivityName, // Use the keyword-based activity name
      activityLevel: pointsInfo.activityLevel,
      pointsAwarded: pointsInfo.points,
      status: 'pending',
      extractedData: {
        rawText: ocrResult.rawText,
        entities: extractedEntities,
        pointsCalculation: pointsInfo
      }
    });
    
    console.log('Certificate created successfully:', certificate);
    res.status(201).json(certificate);
  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: error.stack 
    });
  }
};

// @desc    Get all certificates for a user
// @route   GET /api/certificates
// @access  Private
const getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id });
    console.log('User certificates retrieved:', certificates.length);
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all certificates for a class (teacher only)
// @route   GET /api/certificates/class/:className
// @access  Private/Teacher
const getClassCertificates = async (req, res) => {
  try {
    // Find all users in the specified class who are students
    const students = await User.find({ 
      class: req.params.className,
      role: 'student'
    });
    
    const studentIds = students.map(student => student._id);
    
    // Find all certificates for these students
    const certificates = await Certificate.find({
      user: { $in: studentIds }
    }).populate('user', 'name email class');
    
    console.log('Class certificates retrieved:', certificates.length);
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update certificate status
// @route   PUT /api/certificates/:id
// @access  Private/Teacher
const updateCertificateStatus = async (req, res) => {
  try {
    const { status, pointsAwarded } = req.body;
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    certificate.status = status || certificate.status;
    if (pointsAwarded !== undefined) {
      certificate.pointsAwarded = pointsAwarded;
    }
    
    const updatedCertificate = await certificate.save();
    
    res.json(updatedCertificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Check if the certificate belongs to the user
    if (certificate.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this certificate' });
    }
    
    // Try to delete the file from the filesystem
    try {
      const filePath = path.join(__dirname, '../../', certificate.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      // Continue with deletion even if file removal fails
    }
    
    // Delete the certificate from the database
    await Certificate.deleteOne({ _id: certificate._id });
    
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get points summary for a user
// @route   GET /api/certificates/summary
// @access  Private
const getPointsSummary = async (req, res) => {
  try {
    const certificates = await Certificate.find({ 
      user: req.user._id,
      status: 'approved'
    });
    
    // Group certificates by activity type
    const activityGroups = {};
    let totalPoints = 0;
    
    certificates.forEach(cert => {
      if (!activityGroups[cert.activityType]) {
        activityGroups[cert.activityType] = {
          type: cert.activityType,
          certificates: [],
          totalPoints: 0
        };
      }
      
      activityGroups[cert.activityType].certificates.push({
        id: cert._id,
        name: cert.activityName,
        level: cert.activityLevel,
        points: cert.pointsAwarded
      });
      
      activityGroups[cert.activityType].totalPoints += cert.pointsAwarded;
      totalPoints += cert.pointsAwarded;
    });
    
    const summary = {
      totalPoints,
      activities: Object.values(activityGroups)
    };
    
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  uploadCertificate, 
  getUserCertificates, 
  getClassCertificates, 
  updateCertificateStatus,
  deleteCertificate,
  getPointsSummary
};