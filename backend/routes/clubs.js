const express = require('express');
const {
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
} = require('../controllers/clubController');
const {
  getClubAnnouncements,
  createAnnouncement
} = require('../controllers/announcementController');
const {
  getClubMembershipRequests
} = require('../controllers/membershipController');
const { auth, isClubHead, authorize, canManageClub } = require('../middleware/auth');
const { validateClub, validateAnnouncement, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getClubs);
router.get('/:id', getClub);

// Protected routes
router.get('/:id/announcements', auth, getClubAnnouncements);

// Private routes
router.get('/user/my-clubs', auth, getMyClubs);
router.post('/', auth, authorize('super_admin'), validateClub, handleValidationErrors, createClub);
router.post('/:id/join', auth, joinClub);
router.post('/:id/leave', auth, leaveClub);

// Club management routes (Club Head or Super Admin)
router.put('/:id', auth, isClubHead, updateClub);
router.delete('/:id', auth, isClubHead, deleteClub);
router.delete('/:id/members/:memberId', auth, canManageClub, removeMember);
router.put('/:id/toggle-joining', auth, canManageClub, toggleJoining);

// Announcements (Club Head or Super Admin)
router.post('/:id/announcements', auth, canManageClub, validateAnnouncement, handleValidationErrors, createAnnouncement);

// Membership requests (Club Head or Super Admin)
router.get('/:id/membership-requests', auth, getClubMembershipRequests);

module.exports = router;
