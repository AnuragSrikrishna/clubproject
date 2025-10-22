const express = require('express');
const {
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Update announcement
router.put('/announcements/:id', auth, updateAnnouncement);

// Delete announcement
router.delete('/announcements/:id', auth, deleteAnnouncement);

module.exports = router;
