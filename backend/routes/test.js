const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Test route to create super admin (should be removed in production)
router.post('/create-super-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName, studentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      studentId,
      role: 'super_admin',
      year: 'Graduate',
      major: 'Computer Science'
    });

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create super admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
