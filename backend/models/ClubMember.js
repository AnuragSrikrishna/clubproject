const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure unique membership
clubMemberSchema.index({ clubId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ClubMember', clubMemberSchema);
