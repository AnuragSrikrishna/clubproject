const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const logger = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Super Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    const users = await User.find(query)
      .populate('joinedClubs', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    logger.info(`Super admin ${req.user.email} fetched ${users.length} users`);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Super Admin only)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('joinedClubs', 'name description category')
      .populate({
        path: 'joinedClubs',
        populate: {
          path: 'category',
          select: 'name icon color'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Super admin ${req.user.email} viewed user ${user.email}`);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Super Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role, clubId } = req.body;
    const userId = req.params.id;

    if (!['student', 'club_head', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Prevent changing own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If promoting to club head, handle club assignment
    if (role === 'club_head' && clubId) {
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(400).json({
          success: false,
          message: 'Invalid club specified'
        });
      }

      // Update club head
      await Club.findByIdAndUpdate(clubId, { clubHead: userId });
      
      // Add user to club members if not already a member
      if (!club.members.includes(userId)) {
        await Club.findByIdAndUpdate(clubId, {
          $addToSet: { members: userId }
        });
        
        // Add club to user's joined clubs
        await User.findByIdAndUpdate(userId, {
          $addToSet: { joinedClubs: clubId }
        });
      }

      logger.info(`Super admin ${req.user.email} assigned ${user.email} as club head of ${club.name}`);
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password').populate('joinedClubs', 'name');

    logger.info(`Super admin ${req.user.email} changed role of ${user.email} to ${role}`);

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Super Admin only)
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, year, major, isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        year: year || undefined,
        major: major || undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Super admin ${req.user.email} updated user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting own account
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a club head
    const clubsAsHead = await Club.find({ clubHead: userId });
    if (clubsAsHead.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user who is a club head. Transfer club leadership first.',
        clubs: clubsAsHead.map(club => club.name)
      });
    }

    // Remove user from all clubs
    await Club.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    logger.info(`Super admin ${req.user.email} deleted user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Super Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments({ isActive: true });
    const totalEvents = await Event.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClubHeads = await User.countDocuments({ role: 'club_head' });
    
    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Recent clubs (last 30 days)
    const recentClubs = await Club.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    const stats = {
      totalUsers,
      totalClubs,
      totalEvents,
      totalStudents,
      totalClubHeads,
      recentUsers,
      recentClubs
    };

    logger.info(`Super admin ${req.user.email} accessed dashboard stats`);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

// @desc    Delete club
// @route   DELETE /api/admin/clubs/:id
// @access  Private (Super Admin only)
const deleteClub = async (req, res) => {
  try {
    const clubId = req.params.id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Remove club from all users' joinedClubs
    await User.updateMany(
      { joinedClubs: clubId },
      { $pull: { joinedClubs: clubId } }
    );

    // Delete the club
    await Club.findByIdAndDelete(clubId);

    logger.info(`Super admin ${req.user.email} deleted club ${club.name}`);

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

// @desc    Get clubs without club heads
// @route   GET /api/admin/clubs/no-head
// @access  Private (Super Admin only)
const getClubsWithoutHead = async (req, res) => {
  try {
    const clubs = await Club.find({ 
      isActive: true,
      $or: [
        { clubHead: { $exists: false } },
        { clubHead: null }
      ]
    })
    .populate('category', 'name icon color')
    .populate('creator', 'firstName lastName email')
    .sort({ createdAt: -1 });

    logger.info(`Super admin ${req.user.email} fetched ${clubs.length} clubs without heads`);

    res.status(200).json({
      success: true,
      data: clubs
    });
  } catch (error) {
    logger.error('Get clubs without head error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clubs without heads'
    });
  }
};

// @desc    Assign club head
// @route   PUT /api/admin/clubs/:id/assign-head
// @access  Private (Super Admin only)
const assignClubHead = async (req, res) => {
  try {
    const { userId } = req.body;
    const clubId = req.params.id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role to club head if not already
    if (user.role !== 'club_head' && user.role !== 'super_admin') {
      await User.findByIdAndUpdate(userId, { role: 'club_head' });
    }

    // Update club head
    await Club.findByIdAndUpdate(clubId, { clubHead: userId });
    
    // Add user to club members if not already a member
    if (!club.members.includes(userId)) {
      await Club.findByIdAndUpdate(clubId, {
        $addToSet: { members: userId }
      });
      
      // Add club to user's joined clubs
      await User.findByIdAndUpdate(userId, {
        $addToSet: { joinedClubs: clubId }
      });
    }

    const updatedClub = await Club.findById(clubId)
      .populate('clubHead', 'firstName lastName email')
      .populate('category', 'name icon color');

    logger.info(`Super admin ${req.user.email} assigned ${user.email} as club head of ${club.name}`);

    res.status(200).json({
      success: true,
      message: 'Club head assigned successfully',
      data: updatedClub
    });
  } catch (error) {
    logger.error('Assign club head error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning club head'
    });
  }
};

// @desc    Get all clubs for admin management
// @route   GET /api/admin/clubs
// @access  Private (Super Admin only)
const getAllClubs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const clubs = await Club.find(query)
      .populate('category', 'name icon color')
      .populate('clubHead', 'firstName lastName email')
      .populate('creator', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Club.countDocuments(query);

    logger.info(`Super admin ${req.user.email} fetched ${clubs.length} clubs for management`);

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
    logger.error('Get all clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clubs'
    });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUserRole,
  updateUser,
  deleteUser,
  getDashboardStats,
  deleteClub,
  getClubsWithoutHead,
  assignClubHead,
  getAllClubs
};
