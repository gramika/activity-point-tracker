// /backend/src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  activityHead: {
    type: String,
    enum: [
      'National Initiatives Participation',
      'Sports & Games Participation',
      'Cultural Activities Participation',
      'Professional Self Initiatives',
      'Entrepreneurship and Innovation',
      'Leadership & Management'
    ],
    required: true
  },
  activityNumber: {
    type: String,  
    required: true
  },
  keywords: {
    type: [String],
    required: true,
  },
  pointsPerLevel: {
    I: { type: Number, default: 0 },
    II: { type: Number, default: 0 },
    III: { type: Number, default: 0 },
    IV: { type: Number, default: 0 },
    V: { type: Number, default: 0 },
  },
  prizePoints: {
    first: {
      I: { type: Number, default: 0 },
      II: { type: Number, default: 0 },
      III: { type: Number, default: 0 },
      IV: { type: Number, default: 0 },
      V: { type: Number, default: 0 },
    },
    second: {
      I: { type: Number, default: 0 },
      II: { type: Number, default: 0 },
      III: { type: Number, default: 0 },
      IV: { type: Number, default: 0 },
      V: { type: Number, default: 0 },
    },
    third: {
      I: { type: Number, default: 0 },
      II: { type: Number, default: 0 },
      III: { type: Number, default: 0 },
      IV: { type: Number, default: 0 },
      V: { type: Number, default: 0 },
    }
  },
  hasSpecialRules: {
    type: Boolean,
    default: false
  },
  specialRules: {
    type: String,
    default: ''
  },
  maxPoints: {
    type: Number,
    required: true
  },
  minDuration: {
    type: String,
    default: ''
  },
  approvalDocuments: {
    type: String,
    default: 'a'
  }
}, {
  timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;