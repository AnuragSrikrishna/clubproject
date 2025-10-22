const Club = require('../models/Club');
const User = require('../models/User');
const Category = require('../models/Category');
const MembershipRequest = require('../models/MembershipRequest');
const logger = require('../utils/logger');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, sortBy = 'createdAt' } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    const clubs = await Club.find(query)
      .populate('category', 'name icon color')
      .populate('clubHead', 'firstName lastName email')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Club.countDocuments(query);

    logger.info(`Fetched ${clubs.length} clubs - Page ${page}`);

    res.status(200).json({
      success: true,
      data: clubs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clubs'
    });
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
const getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('category', 'name icon color description')
      .populate('clubHead', 'firstName lastName email profilePicture')
      .populate('creator', 'firstName lastName email profilePicture')
      .populate('members', 'firstName lastName email profilePicture year major');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    if (!club.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Club is not active'
      });
    }

    // Check if current user is a member (if authenticated)
    let isMember = false;
    let isClubHead = false;
    let membershipStatus = null;

    if (req.user) {
      // Check if user is a member
      isMember = club.members.some(member => {
        const memberId = member._id || member;
        return memberId.toString() === req.user._id.toString();
      });
      
      // Check if user is club head
      isClubHead = club.clubHead && club.clubHead._id.toString() === req.user._id.toString();
      
      // Check membership request status
      const membershipRequest = await MembershipRequest.findOne({
        userId: req.user._id,
        clubId: club._id
      });
      
      if (membershipRequest) {
        membershipStatus = membershipRequest.status;
      }
    }

    logger.info(`Club ${club.name} viewed by user ${req.user?.email || 'anonymous'}`);

    res.status(200).json({
      success: true,
      data: {
        ...club.toObject(),
        userStatus: {
          isMember,
          isClubHead,
          membershipStatus
        }
      }
    });
  } catch (error) {
    logger.error('Get club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching club'
    });
  }
};

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private (Club Head only)
const createClub = async (req, res) => {
  try {
    const { name, description, category, contactEmail, meetingSchedule, requirements, tags, maxMembers } = req.body;

    // Only super admins can create clubs
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can create clubs.'
      });
    }

    // Check if club name already exists
    const existingClub = await Club.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: 'Club with this name already exists'
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    const club = await Club.create({
      name,
      description,
      category,
      contactEmail,
      meetingSchedule,
      requirements,
      tags: tags || [],
      maxMembers,
      creator: req.user.id,
      clubHead: req.user.id,
      members: [req.user.id]
    });

    // Add club to user's joined clubs
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedClubs: club._id }
    });

    const populatedClub = await Club.findById(club._id)
      .populate('category', 'name icon color')
      .populate('clubHead', 'firstName lastName email')
      .populate('creator', 'firstName lastName email');

    logger.info(`New club created: ${club.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: populatedClub
    });
  } catch (error) {
    logger.error('Create club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating club'
    });
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (Club Head)
const updateClub = async (req, res) => {
  try {
    const { name, description, category, contactEmail, meetingSchedule, requirements, tags, maxMembers, logo } = req.body;

    // Check if new name conflicts with existing clubs
    if (name && name !== req.club.name) {
      const existingClub = await Club.findOne({ 
        name: new RegExp(`^${name}$`, 'i'),
        _id: { $ne: req.params.id }
      });
      
      if (existingClub) {
        return res.status(400).json({
          success: false,
          message: 'Club with this name already exists'
        });
      }
    }

    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      {
        name: name || req.club.name,
        description: description || req.club.description,
        category: category || req.club.category,
        contactEmail: contactEmail || req.club.contactEmail,
        meetingSchedule: meetingSchedule || req.club.meetingSchedule,
        requirements: requirements || req.club.requirements,
        tags: tags || req.club.tags,
        maxMembers: maxMembers || req.club.maxMembers,
        logo: logo || req.club.logo
      },
      { new: true, runValidators: true }
    ).populate('category', 'name icon color');

    logger.info(`Club updated: ${updatedClub.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Club updated successfully',
      data: updatedClub
    });
  } catch (error) {
    logger.error('Update club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating club'
    });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (Club Head or Super Admin)
const deleteClub = async (req, res) => {
  try {
    // Soft delete by setting isActive to false
    await Club.findByIdAndUpdate(req.params.id, { isActive: false });

    // Remove club from all users' joinedClubs
    await User.updateMany(
      { joinedClubs: req.params.id },
      { $pull: { joinedClubs: req.params.id } }
    );

    logger.info(`Club deleted: ${req.club.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    logger.error('Delete club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting club'
    });
  }
};

// @desc    Join club
// @route   POST /api/clubs/:id/join
// @access  Private
const joinClub = async (req, res) => {
  try {
    const { message } = req.body;
    const clubId = req.params.id;
    const userId = req.user.id;

    const club = await Club.findById(clubId);
    if (!club || !club.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if joining is allowed
    if (!club.allowJoining) {
      return res.status(400).json({
        success: false,
        message: 'This club is currently not accepting new members'
      });
    }

    // Check if user is already a member
    if (club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club'
      });
    }

    // Check if there's already a pending request
    const existingRequest = await MembershipRequest.findOne({
      userId,
      clubId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending membership request'
      });
    }

    // Check membership limit
    if (club.maxMembers && club.members.length >= club.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Club has reached maximum membership capacity'
      });
    }

    // Create membership request
    const membershipRequest = await MembershipRequest.create({
      userId,
      clubId,
      requestMessage: message || ''
    });

    logger.info(`Membership request created for club ${club.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Membership request submitted successfully',
      data: membershipRequest
    });
  } catch (error) {
    logger.error('Join club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing membership request'
    });
  }
};

// @desc    Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private
const leaveClub = async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.user.id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is a member
    if (!club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this club'
      });
    }

    // Prevent last club head from leaving
    if (club.clubHead.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave club as the club head. Transfer leadership first.'
      });
    }

    // Remove user from club
    await Club.findByIdAndUpdate(clubId, {
      $pull: { 
        members: userId
      }
    });

    // Remove club from user's joined clubs
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedClubs: clubId }
    });

    logger.info(`User ${req.user.email} left club ${club.name}`);

    res.status(200).json({
      success: true,
      message: 'Successfully left the club'
    });
  } catch (error) {
    logger.error('Leave club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while leaving club'
    });
  }
};

// @desc    Get user's clubs
// @route   GET /api/clubs/my-clubs
// @access  Private
const getMyClubs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'joinedClubs',
        populate: {
          path: 'category',
          select: 'name icon color'
        },
        select: 'name description category logo memberCount isActive admins'
      });

    const myClubs = user.joinedClubs.filter(club => club.isActive);

    res.status(200).json({
      success: true,
      data: myClubs
    });
  } catch (error) {
    logger.error('Get my clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your clubs'
    });
  }
};

// @desc    Remove member from club
// @route   DELETE /api/clubs/:id/members/:memberId
// @access  Private (Club Head or Super Admin)
const removeMember = async (req, res) => {
  try {
    const { id: clubId, memberId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is club head or super admin
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members'
      });
    }

    // Check if member exists in club
    if (!club.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this club'
      });
    }

    // Prevent removing the club head
    if (club.clubHead.equals(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the club head'
      });
    }

    // Remove member from club
    await Club.findByIdAndUpdate(clubId, {
      $pull: { members: memberId }
    });

    // Remove club from user's joined clubs
    await User.findByIdAndUpdate(memberId, {
      $pull: { joinedClubs: clubId }
    });

    const removedUser = await User.findById(memberId).select('firstName lastName email');

    logger.info(`Member ${removedUser.email} removed from club ${club.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    logger.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing member'
    });
  }
};

// @desc    Toggle club joining availability
// @route   PUT /api/clubs/:id/toggle-joining
// @access  Private (Club Head or Super Admin)
const toggleJoining = async (req, res) => {
  try {
    const clubId = req.params.id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is club head or super admin
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify club settings'
      });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      { allowJoining: !club.allowJoining },
      { new: true }
    );

    logger.info(`Club joining toggled for ${club.name} by ${req.user.email}. New status: ${updatedClub.allowJoining}`);

    res.status(200).json({
      success: true,
      message: `Club joining ${updatedClub.allowJoining ? 'enabled' : 'disabled'} successfully`,
      data: { allowJoining: updatedClub.allowJoining }
    });
  } catch (error) {
    logger.error('Toggle joining error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling club joining'
    });
  }
};

module.exports = {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  getMyClubs,
  removeMember,
  toggleJoining
};
