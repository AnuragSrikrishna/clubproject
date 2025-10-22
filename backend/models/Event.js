const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Club ID is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  dateTime: {
    type: Date,
    required: [true, 'Event date and time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'Event end date and time is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  requirements: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Validate that end time is after start time
eventSchema.pre('save', function(next) {
  if (this.endDateTime <= this.dateTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Index for date queries
eventSchema.index({ dateTime: 1, status: 1 });
eventSchema.index({ clubId: 1, dateTime: 1 });

module.exports = mongoose.model('Event', eventSchema);
