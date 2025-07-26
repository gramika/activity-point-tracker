// /backend/src/controllers/eventController.js
const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { 
      name, 
      activityHead, 
      activityNumber,
      keywords, 
      pointsPerLevel, 
      prizePoints,
      hasSpecialRules,
      specialRules,
      maxPoints,
      minDuration,
      approvalDocuments 
    } = req.body;
    
    const event = await Event.create({
      name,
      activityHead,
      activityNumber,
      keywords,
      pointsPerLevel,
      prizePoints,
      hasSpecialRules,
      specialRules,
      maxPoints,
      minDuration,
      approvalDocuments
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const { 
      name, 
      activityHead, 
      activityNumber,
      keywords, 
      pointsPerLevel, 
      prizePoints,
      hasSpecialRules,
      specialRules,
      maxPoints,
      minDuration,
      approvalDocuments 
    } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    event.name = name || event.name;
    event.activityHead = activityHead || event.activityHead;
    event.activityNumber = activityNumber || event.activityNumber;
    event.keywords = keywords || event.keywords;
    event.pointsPerLevel = pointsPerLevel || event.pointsPerLevel;
    event.prizePoints = prizePoints || event.prizePoints;
    event.hasSpecialRules = hasSpecialRules !== undefined ? hasSpecialRules : event.hasSpecialRules;
    event.specialRules = specialRules !== undefined ? specialRules : event.specialRules;
    event.maxPoints = maxPoints || event.maxPoints;
    event.minDuration = minDuration || event.minDuration;
    event.approvalDocuments = approvalDocuments || event.approvalDocuments;
    
    const updatedEvent = await event.save();
    
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await Event.deleteOne({ _id: event._id });
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Search events by keywords
// @route   GET /api/events/search/:query
// @access  Private
const searchEvents = async (req, res) => {
  try {
    const query = req.params.query;
    
    // Search by name or keywords
    const events = await Event.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { keywords: { $elemMatch: { $regex: query, $options: 'i' } } }
      ]
    });
    
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents
};