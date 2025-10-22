const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Club description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true }
  },
  logo: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Club creator is required']
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  meetingSchedule: {
    type: String,
    default: ''
  },
  requirements: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  maxMembers: {
    type: Number,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowJoining: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update member count before saving
clubSchema.pre('save', function(next) {
  // Member count will be calculated from ClubMember collection
  next();
});

// Index for search functionality
clubSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Club', clubSchema);
