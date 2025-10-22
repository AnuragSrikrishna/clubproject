const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, studentId, year, major } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });

    if (existingUser) {
      logger.warn(`Registration attempt with existing credentials: ${email}`);
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Student ID already registered'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      studentId,
      year,
      major
    });

    logger.info(`New user registered: ${user.email}`);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        studentId: user.studentId,
        year: user.year,
        major: user.major,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      logger.warn(`Login attempt by deactivated user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    logger.info(`Successful login: ${user.email}`);

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        studentId: user.studentId,
        year: user.year,
        major: user.major,
        role: user.role,
        profilePicture: user.profilePicture,
        joinedClubs: user.joinedClubs
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('joinedClubs', 'name description category logo')
      .populate({
        path: 'joinedClubs',
        populate: {
          path: 'category',
          select: 'name icon color'
        }
      });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        studentId: user.studentId,
        year: user.year,
        major: user.major,
        role: user.role,
        profilePicture: user.profilePicture,
        joinedClubs: user.joinedClubs,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, year, major, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        year: year || req.user.year,
        major: major || req.user.major,
        profilePicture: profilePicture || req.user.profilePicture
      },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        studentId: user.studentId,
        year: user.year,
        major: user.major,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
