const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Private routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

module.exports = router;
