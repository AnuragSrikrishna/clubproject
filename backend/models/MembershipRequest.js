const mongoose = require('mongoose');

const membershipRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Club ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestMessage: {
    type: String,
    maxlength: [500, 'Request message cannot exceed 500 characters'],
    default: ''
  },
  adminResponse: {
    type: String,
    maxlength: [500, 'Admin response cannot exceed 500 characters'],
    default: ''
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure one request per user per club
membershipRequestSchema.index({ userId: 1, clubId: 1 }, { unique: true });

// Update respondedAt when status changes
membershipRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.respondedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('MembershipRequest', membershipRequestSchema);
