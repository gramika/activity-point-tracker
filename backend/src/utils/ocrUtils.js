const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const processOCR = async (imagePath) => {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post('http://localhost:5001/process', formData, {
      headers: formData.getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('OCR Processing Error:', error);
    throw new Error('Failed to process the image with OCR');
  }
};

module.exports = { processOCR };