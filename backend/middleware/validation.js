const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('studentId')
    .trim()
    .isLength({ min: 4 })
    .withMessage('Student ID must be at least 4 characters long'),
  body('year')
    .isIn(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'])
    .withMessage('Please select a valid academic year'),
  body('major')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Major must be at least 2 characters long')
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for club creation
const validateClub = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Club name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isMongoId()
    .withMessage('Please provide a valid category'),
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email')
];

// Validation rules for event creation
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('dateTime')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date and time'),
  body('endDateTime')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date and time'),
  body('location')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters')
];

// Validation rules for announcements
const validateAnnouncement = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateClub,
  validateEvent,
  validateAnnouncement,
  handleValidationErrors
};
