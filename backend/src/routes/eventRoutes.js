// /backend/src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents
} = require('../controllers/eventController');
const { protect, teacherOnly } = require('../middleware/authMiddleware'); // Use teacherOnly instead of teacher or admin

// Routes
router.route('/')
  .get(protect, getEvents)
  .post(protect, teacherOnly, createEvent); // Changed from admin to teacherOnly

router.route('/search/:query')
  .get(protect, searchEvents);

router.route('/:id')
  .get(protect, getEventById)
  .put(protect, teacherOnly, updateEvent) // Changed from admin to teacherOnly
  .delete(protect, teacherOnly, deleteEvent); // Changed from admin to teacherOnly

module.exports = router;