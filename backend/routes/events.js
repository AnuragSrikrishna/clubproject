const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { canManageClub } = require('../middleware/clubs');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getClubEvents,
  getMyEvents
} = require('../controllers/eventController');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/club/:id', getClubEvents);

// Private routes
router.use(auth); // All routes below require authentication

// User event routes
router.get('/user/my-events', getMyEvents);
router.post('/:id/join', joinEvent);
router.post('/:id/leave', leaveEvent);

// Management routes (Club Head or Super Admin)
router.post('/', authorize(['super_admin', 'club_head']), createEvent);
router.put('/:id', authorize(['super_admin', 'club_head']), updateEvent);
router.delete('/:id', authorize(['super_admin', 'club_head']), deleteEvent);

module.exports = router;
