const Event = require('../models/Event');
const Club = require('../models/Club');
const logger = require('../utils/logger');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      clubId, 
      status = 'upcoming',
      search,
      startDate,
      endDate
    } = req.query;

    let query = {};

    // Filter by club if specified
    if (clubId) {
      query.clubId = clubId;
    }

    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .populate('clubId', 'name logo category')
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Event.countDocuments(query);

    logger.info(`Fetched ${events.length} events - Page ${page}`);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name logo category description')
      .populate('organizer', 'firstName lastName email profilePicture')
      .populate('attendees', 'firstName lastName email profilePicture year major');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if current user is attending (if authenticated)
    let isAttending = false;
    if (req.user) {
      isAttending = event.attendees.some(attendee => 
        attendee._id.toString() === req.user._id.toString()
      );
    }

    logger.info(`Event ${event.title} viewed by user ${req.user?.email || 'anonymous'}`);

    res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        userStatus: {
          isAttending,
          canEdit: req.user && (
            req.user.role === 'super_admin' || 
            event.organizer._id.toString() === req.user._id.toString()
          )
        }
      }
    });
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Club Head or Super Admin)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      clubId,
      dateTime,
      endDateTime,
      location,
      maxAttendees,
      requirements,
      imageUrl,
      tags,
      isPublic
    } = req.body;

    // Verify club exists and user can create events for it
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user can create events for this club
    const canCreateEvent = req.user.role === 'super_admin' || 
      (club.clubHead && club.clubHead.toString() === req.user._id.toString());

    if (!canCreateEvent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create events for this club'
      });
    }

    // Validate event dates
    const eventDate = new Date(dateTime);
    const eventEndDate = new Date(endDateTime);
    const now = new Date();

    if (eventDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    if (eventEndDate <= eventDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const event = await Event.create({
      title,
      description,
      clubId,
      organizer: req.user._id,
      dateTime: eventDate,
      endDateTime: eventEndDate,
      location,
      maxAttendees: maxAttendees || null,
      requirements: requirements || '',
      imageUrl: imageUrl || '',
      tags: tags || [],
      isPublic: isPublic !== false
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('clubId', 'name logo category')
      .populate('organizer', 'firstName lastName email');

    logger.info(`Event created: ${event.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent
    });
  } catch (error) {
    logger.error('Create event error:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: message[0] || 'Validation error'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Event Organizer or Super Admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'dateTime', 'endDateTime', 
      'location', 'maxAttendees', 'requirements', 'imageUrl', 
      'tags', 'isPublic', 'status'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate dates if being updated
    if (updates.dateTime || updates.endDateTime) {
      const eventDate = new Date(updates.dateTime || event.dateTime);
      const eventEndDate = new Date(updates.endDateTime || event.endDateTime);

      if (eventEndDate <= eventDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('clubId', 'name logo category')
     .populate('organizer', 'firstName lastName email');

    logger.info(`Event updated: ${updatedEvent.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Event Organizer or Super Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    logger.info(`Event deleted: ${event.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
};

// @desc    Join event
// @route   POST /api/events/:id/join
// @access  Private
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is upcoming
    if (event.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join event that is not upcoming'
      });
    }

    // Check if already attending
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    event.attendees.push(req.user._id);
    await event.save();

    logger.info(`User ${req.user.email} joined event ${event.title}`);

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    logger.error('Join event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining event'
    });
  }
};

// @desc    Leave event
// @route   POST /api/events/:id/leave
// @access  Private
const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if attending
    if (!event.attendees.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.user._id.toString()
    );
    await event.save();

    logger.info(`User ${req.user.email} left event ${event.title}`);

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    logger.error('Leave event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while leaving event'
    });
  }
};

// @desc    Get events for a club
// @route   GET /api/clubs/:id/events
// @access  Public
const getClubEvents = async (req, res) => {
  try {
    const { status = 'upcoming', page = 1, limit = 10 } = req.query;
    const clubId = req.params.id;

    let query = { clubId };
    if (status !== 'all') {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    logger.info(`Fetched ${events.length} events for club ${clubId}`);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get club events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching club events'
    });
  }
};

// @desc    Get user's events
// @route   GET /api/events/user/my-events
// @access  Private
const getMyEvents = async (req, res) => {
  try {
    const { type = 'attending', status = 'upcoming' } = req.query;

    let query = {};
    
    if (type === 'organizing') {
      query.organizer = req.user._id;
    } else {
      query.attendees = req.user._id;
    }

    if (status !== 'all') {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('clubId', 'name logo category')
      .populate('organizer', 'firstName lastName email')
      .sort({ dateTime: 1 });

    logger.info(`Fetched ${events.length} ${type} events for user ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    logger.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your events'
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getClubEvents,
  getMyEvents
};
