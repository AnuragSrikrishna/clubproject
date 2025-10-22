const Announcement = require('../models/Announcement');
const Club = require('../models/Club');
const logger = require('../utils/logger');

// @desc    Get club announcements
// @route   GET /api/clubs/:id/announcements
// @access  Private (Members only)
const getClubAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    // Support both :id and :clubId parameter names
    const clubId = req.params.id || req.params.clubId;

    // Check if user is authenticated for this protected route
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view announcements'
      });
    }

    // Check if club exists
    const Club = require('../models/Club');
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is a member of the club or super admin
    if (!club.members.includes(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only club members can view announcements'
      });
    }

    const announcements = await Announcement.find({ 
      clubId, 
      isActive: true 
    })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments({ 
      clubId, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get club announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
};

// @desc    Create announcement
// @route   POST /api/clubs/:id/announcements
// @access  Private (Club Head or Super Admin)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetAudience, expiresAt } = req.body;
    const clubId = req.params.id; // Changed from clubId to id

    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user can create announcements for this club
    if (req.user.role !== 'super_admin' && club.clubHead.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only club heads and super admins can create announcements'
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      clubId,
      author: req.user.id,
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all_members',
      expiresAt: expiresAt || null
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName')
      .populate('clubId', 'name');

    logger.info(`New announcement created for club ${club.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: populatedAnnouncement
    });
  } catch (error) {
    logger.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement'
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Club Head only)
const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, isActive, expiresAt } = req.body;
    const announcementId = req.params.id;

    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if user is club head of the club
    const club = await Club.findById(announcement.clubId);
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this announcement'
      });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      {
        title: title || announcement.title,
        content: content || announcement.content,
        priority: priority || announcement.priority,
        isActive: isActive !== undefined ? isActive : announcement.isActive,
        expiresAt: expiresAt || announcement.expiresAt
      },
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName');

    logger.info(`Announcement ${announcementId} updated by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error) {
    logger.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement'
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Club Head only)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;

    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if user is club head of the club
    const club = await Club.findById(announcement.clubId);
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement'
      });
    }

    await Announcement.findByIdAndDelete(announcementId);

    logger.info(`Announcement ${announcementId} deleted by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    logger.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement'
    });
  }
};

module.exports = {
  getClubAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
