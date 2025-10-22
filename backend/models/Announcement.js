const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Club ID is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  targetAudience: {
    type: String,
    enum: ['all_members', 'admins_only', 'new_members'],
    default: 'all_members'
  }
}, {
  timestamps: true
});

// Index for efficient queries
announcementSchema.index({ clubId: 1, createdAt: -1 });
announcementSchema.index({ isActive: 1, priority: 1 });

// Auto-deactivate expired announcements
announcementSchema.pre('find', function() {
  this.where({
    $or: [
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } }
    ]
  });
});

module.exports = mongoose.model('Announcement', announcementSchema);
