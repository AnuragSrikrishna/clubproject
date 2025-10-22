const express = require('express');
const {
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
} = require('../controllers/adminController');

const router = express.Router();

// Note: These routes will use the auth middleware from server-mongodb.js
// The auth and authorize middleware will be applied at the server level

// Dashboard
router.get('/dashboard', (req, res, next) => {
  console.log('🔥 Admin dashboard route hit!');
  next();
}, getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Club management
router.get('/clubs', getAllClubs);
router.get('/clubs/no-head', getClubsWithoutHead);
router.put('/clubs/:id/assign-head', assignClubHead);
router.delete('/clubs/:id', deleteClub);

module.exports = router;
