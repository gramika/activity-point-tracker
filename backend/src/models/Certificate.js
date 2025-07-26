const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  activityType: {
    type: String,
    required: true,
  },
  activityName: {
    type: String,
    required: true,
  },
  activityLevel: {
    type: String,
    enum: ['I', 'II', 'III', 'IV', 'V', 'none'],
    default: 'none',
  },
  pointsAwarded: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  extractedData: {
    type: Object,
    default: {},
  }
}, {
  timestamps: true,
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;