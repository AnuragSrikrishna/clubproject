const MembershipRequest = require('../models/MembershipRequest');
const Club = require('../models/Club');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get membership requests for a club
// @route   GET /api/clubs/:id/membership-requests
// @access  Private (Club Head or Super Admin)
const getClubMembershipRequests = async (req, res) => {
  try {
    const clubId = req.params.id; // Changed from clubId to id
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user can view membership requests
    if (req.user.role !== 'super_admin' && club.clubHead.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view membership requests for this club'
      });
    }

    let query = { clubId };
    if (status !== 'all') {
      query.status = status;
    }

    const requests = await MembershipRequest.find(query)
      .populate('userId', 'firstName lastName email studentId year major profilePicture')
      .populate('respondedBy', 'firstName lastName email')
      .sort({ requestedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MembershipRequest.countDocuments(query);

    logger.info(`Club head ${req.user.email} viewed membership requests for ${club.name}`);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get club membership requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching membership requests'
    });
  }
};

// @desc    Approve/Reject membership request
// @route   PUT /api/membership-requests/:id
// @access  Private (Club Head or Super Admin)
const updateMembershipRequest = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const requestId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const membershipRequest = await MembershipRequest.findById(requestId)
      .populate('userId')
      .populate('clubId');

    if (!membershipRequest) {
      return res.status(404).json({
        success: false,
        message: 'Membership request not found'
      });
    }

    // Check if user is club head or super admin
    const club = await Club.findById(membershipRequest.clubId._id);
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage membership requests for this club'
      });
    }

    // Update the membership request
    membershipRequest.status = status;
    membershipRequest.adminResponse = adminResponse || '';
    membershipRequest.respondedBy = req.user.id;
    await membershipRequest.save();

    // If approved, add user to club
    if (status === 'approved') {
      // Check membership limit
      if (club.maxMembers && club.members.length >= club.maxMembers) {
        return res.status(400).json({
          success: false,
          message: 'Club has reached maximum membership capacity'
        });
      }

      // Add user to club members
      await Club.findByIdAndUpdate(club._id, {
        $addToSet: { members: membershipRequest.userId._id }
      });

      // Add club to user's joined clubs
      await User.findByIdAndUpdate(membershipRequest.userId._id, {
        $addToSet: { joinedClubs: club._id }
      });

      logger.info(`User ${membershipRequest.userId.email} approved for club ${club.name} by ${req.user.email}`);
    } else {
      logger.info(`User ${membershipRequest.userId.email} rejected for club ${club.name} by ${req.user.email}`);
    }

    const updatedRequest = await MembershipRequest.findById(requestId)
      .populate('userId', 'firstName lastName email')
      .populate('respondedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: `Membership request ${status}`,
      data: updatedRequest
    });
  } catch (error) {
    logger.error('Update membership request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating membership request'
    });
  }
};

// @desc    Remove member from club
// @route   DELETE /api/clubs/:clubId/members/:userId
// @access  Private (Club Head only)
const removeMember = async (req, res) => {
  try {
    const { clubId, userId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is club head
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this club'
      });
    }

    // Cannot remove the club head
    if (club.clubHead.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the club head from the club'
      });
    }

    // Check if user is a member
    if (!club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this club'
      });
    }

    // Remove user from club
    await Club.findByIdAndUpdate(clubId, {
      $pull: { members: userId }
    });

    // Remove club from user's joined clubs
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedClubs: clubId }
    });

    const user = await User.findById(userId);
    logger.info(`User ${user.email} removed from club ${club.name} by ${req.user.email}`);

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

// @desc    Add member directly to club
// @route   POST /api/clubs/:clubId/members
// @access  Private (Club Head only)
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const clubId = req.params.clubId;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is club head
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members to this club'
      });
    }

    // Check if user is already a member
    if (club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this club'
      });
    }

    // Check membership limit
    if (club.maxMembers && club.members.length >= club.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Club has reached maximum membership capacity'
      });
    }

    // Add user to club
    await Club.findByIdAndUpdate(clubId, {
      $addToSet: { members: userId }
    });

    // Add club to user's joined clubs
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedClubs: clubId }
    });

    logger.info(`User ${user.email} added to club ${club.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }
    });
  } catch (error) {
    logger.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding member'
    });
  }
};

module.exports = {
  getClubMembershipRequests,
  updateMembershipRequest,
  removeMember,
  addMember
};
