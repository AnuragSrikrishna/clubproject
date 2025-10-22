const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mock data
const mockEvents = [
  {
    _id: 'event1',
    title: 'JavaScript Workshop',
    description: 'Learn modern JavaScript concepts and best practices.',
    clubId: { _id: 'club1', name: 'Programming Club' },
    organizer: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location: 'Computer Lab A',
    status: 'upcoming',
    attendees: [],
    maxAttendees: 30
  },
  {
    _id: 'event2',
    title: 'Photography Walk',
    description: 'Explore campus beauty through your lens.',
    clubId: { _id: 'club2', name: 'Photography Club' },
    organizer: { _id: 'user2', firstName: 'Jane', lastName: 'Smith' },
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: 'Campus Gardens',
    status: 'upcoming',
    attendees: [],
    maxAttendees: 20
  }
];

const mockClubs = [
  { _id: 'club1', name: 'Programming Club' },
  { _id: 'club2', name: 'Photography Club' },
  { _id: 'club3', name: 'Music Club' },
  { _id: 'club4', name: 'Debate Club' }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Events endpoints
app.get('/api/events', (req, res) => {
  res.json({
    success: true,
    data: mockEvents
  });
});

app.get('/api/events/user/my-events', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.post('/api/events', (req, res) => {
  const newEvent = {
    _id: 'event' + Date.now(),
    ...req.body,
    organizer: { _id: 'user1', firstName: 'Demo', lastName: 'User' },
    clubId: mockClubs.find(c => c._id === req.body.clubId) || mockClubs[0],
    status: 'upcoming',
    attendees: []
  };
  mockEvents.push(newEvent);
  res.status(201).json({
    success: true,
    data: newEvent,
    message: 'Event created successfully'
  });
});

// Clubs endpoints
app.get('/api/clubs', (req, res) => {
  res.json({
    success: true,
    data: mockClubs
  });
});

app.get('/api/clubs/user/my-clubs', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  
  // Mock registration - in real app this would validate and save to database
  const newUser = {
    _id: 'user-' + Date.now(),
    firstName,
    lastName,
    email,
    role: role || 'student' // Default to student role
  };
  
  res.status(201).json({
    success: true,
    token: 'demo-token-' + Date.now(),
    user: newUser,
    message: 'Registration successful'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'demo-token',
    user: {
      _id: 'demo-user',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@college.edu',
      role: 'super_admin'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      _id: 'demo-user',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@college.edu',
      role: 'super_admin'
    }
  });
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { _id: 'cat1', name: 'Technology', color: '#2196F3' },
      { _id: 'cat2', name: 'Arts', color: '#FF9800' },
      { _id: 'cat3', name: 'Sports', color: '#4CAF50' }
    ]
  });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Mock Backend Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Events API: http://localhost:${PORT}/api/events`);
});
