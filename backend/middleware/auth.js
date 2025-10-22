const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('No token provided for authentication');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      logger.warn(`User not found for token: ${decoded.id}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    if (!user.isActive) {
      logger.warn(`Inactive user attempted access: ${user.email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'User account is deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} with role ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is club head for a specific club
const isClubHead = async (req, res, next) => {
  try {
    const Club = require('../models/Club');
    // Support both :id and :clubId parameter names
    const clubId = req.params.id || req.params.clubId || req.body.clubId;
    
    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required'
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is the club head or super admin
    if (!club.clubHead.equals(req.user._id) && req.user.role !== 'super_admin') {
      logger.warn(`Unauthorized club head access attempt by ${req.user.email} for club ${clubId}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized as club head'
      });
    }

    req.club = club;
    next();
  } catch (error) {
    logger.error('Club head authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

// Check if user can manage club (Club Head or Super Admin)
const canManageClub = async (req, res, next) => {
  try {
    const Club = require('../models/Club');
    // Support both :id and :clubId parameter names
    const clubId = req.params.id || req.params.clubId || req.body.clubId;
    
    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required'
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Allow if user is super admin or club head (handle null clubHead)
    if (req.user.role === 'super_admin' || (club.clubHead && club.clubHead.equals(req.user._id))) {
      req.club = club;
      next();
    } else {
      logger.warn(`Unauthorized club management attempt by ${req.user.email} for club ${clubId}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this club'
      });
    }
  } catch (error) {
    logger.error('Club management authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = { auth, authorize, isClubHead, canManageClub };
