const express = require('express');
const {
  getClubMembershipRequests,
  updateMembershipRequest,
  removeMember,
  addMember
} = require('../controllers/membershipController');
const { auth, isClubHead } = require('../middleware/auth');

const router = express.Router();

// Get membership requests for a club (Club Head or Super Admin)
router.get('/clubs/:clubId/membership-requests', auth, isClubHead, getClubMembershipRequests);

// Approve/reject membership request (Club Head or Super Admin)
router.put('/membership-requests/:id', auth, updateMembershipRequest);

// Club member management (Club Head or Super Admin)
router.post('/clubs/:clubId/members', auth, isClubHead, addMember);
router.delete('/clubs/:clubId/members/:userId', auth, isClubHead, removeMember);

module.exports = router;
