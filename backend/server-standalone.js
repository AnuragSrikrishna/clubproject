const express = require('express');
const cors = require('cors');
const app = express();

// Enhanced logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔷 [${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log(`📥 Headers:`, JSON.stringify(req.headers, null, 2));
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, JSON.stringify(req.body, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`🔍 Query:`, JSON.stringify(req.query, null, 2));
  }
  
  // Capture the original res.json to log responses
  const originalJson = res.json;
  res.json = function(body) {
    console.log(`📤 Response [${res.statusCode}]:`, JSON.stringify(body, null, 2));
    console.log(`🔶 Request completed: ${req.method} ${req.originalUrl}\n`);
    return originalJson.call(this, body);
  };
  
  next();
};

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use(requestLogger);

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
    attendees: ['user2'],
    maxAttendees: 30,
    createdAt: new Date().toISOString()
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
    attendees: ['user1', 'user3'],
    maxAttendees: 20,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'event3',
    title: 'Music Jam Session',
    description: 'Bring your instruments and let\'s make music together!',
    clubId: { _id: 'club3', name: 'Music Club' },
    organizer: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: 'Music Room 101',
    status: 'upcoming',
    attendees: ['user2'],
    maxAttendees: 15,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'event4',
    title: 'Debate Tournament',
    description: 'Test your argumentation skills in our monthly debate tournament.',
    clubId: { _id: 'club4', name: 'Debate Club' },
    organizer: { _id: 'user2', firstName: 'Jane', lastName: 'Smith' },
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    location: 'Auditorium',
    status: 'upcoming',
    attendees: ['user1', 'user3'],
    maxAttendees: 25,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'event5',
    title: 'Past Coding Bootcamp',
    description: 'A completed intensive coding bootcamp.',
    clubId: { _id: 'club1', name: 'Programming Club' },
    organizer: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
    dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    location: 'Computer Lab B',
    status: 'completed',
    attendees: ['user2', 'user3'],
    maxAttendees: 20,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockClubs = [
  { 
    _id: 'club1', 
    name: 'Programming Club', 
    description: 'Learn programming together', 
    memberCount: 25,
    admins: ['user1'],
    category: { _id: 'cat1', name: 'Technology', color: '#2196F3', icon: '💻' },
    logo: null,
    allowJoining: true,
    requireApproval: false // Direct joining allowed
  },
  { 
    _id: 'club2', 
    name: 'Photography Club', 
    description: 'Capture beautiful moments', 
    memberCount: 18,
    admins: ['user2'],
    category: { _id: 'cat2', name: 'Arts', color: '#FF9800', icon: '📸' },
    logo: null,
    allowJoining: true,
    requireApproval: true // Requires approval
  },
  { 
    _id: 'club3', 
    name: 'Music Club', 
    description: 'Make music together', 
    memberCount: 30,
    admins: ['user1'],
    category: { _id: 'cat2', name: 'Arts', color: '#FF9800', icon: '🎵' },
    logo: null,
    allowJoining: true,
    requireApproval: true // Requires approval
  },
  { 
    _id: 'club4', 
    name: 'Debate Club', 
    description: 'Sharpen your argumentation skills', 
    memberCount: 15,
    admins: ['user2'],
    category: { _id: 'cat4', name: 'Academic', color: '#9C27B0', icon: '🎤' },
    logo: null,
    allowJoining: true,
    requireApproval: false // Direct joining allowed
  }
];

const mockUsers = [
  { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@college.edu', role: 'super_admin' },
  { _id: 'user2', firstName: 'Jane', lastName: 'Smith', email: 'jane@college.edu', role: 'club_head' },
  { _id: 'user3', firstName: 'Alice', lastName: 'Johnson', email: 'alice@college.edu', role: 'student' }
];

// Store for registered users and created clubs
const registeredUsers = new Map();
const createdClubs = new Map();
const clubMembers = new Map(); // clubId -> Set of userIds
const membershipRequests = new Map(); // clubId -> Map of requestId -> request object
const rejectedRequests = new Map(); // clubId -> Set of userIds who were rejected

// Initialize club members for existing clubs with realistic data
clubMembers.set('club1', new Set(['user1', 'user2', 'user3'])); // Programming Club - 3 members
clubMembers.set('club2', new Set(['user2', 'user3'])); // Photography Club - 2 members  
clubMembers.set('club3', new Set(['user1', 'user3'])); // Music Club - 2 members
clubMembers.set('club4', new Set(['user2', 'user3'])); // Debate Club - 2 members (added user3)

// Update mock clubs with correct member counts
mockClubs[0].memberCount = 3; // Programming Club
mockClubs[1].memberCount = 2; // Photography Club  
mockClubs[2].memberCount = 2; // Music Club
mockClubs[3].memberCount = 2; // Debate Club

// Initialize some sample membership requests for demonstration
const initializeSampleMembershipRequests = () => {
  // Photography Club (requires approval) - sample requests
  const photographyRequests = new Map();
  
  photographyRequests.set('req-sample-1', {
    _id: 'req-sample-1',
    clubId: 'club2',
    userId: 'user3',
    user: {
      _id: 'user3',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@college.edu',
      role: 'student'
    },
    status: 'pending',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    message: 'I am passionate about photography and would love to join the club to improve my skills.'
  });
  
  membershipRequests.set('club2', photographyRequests);
  
  // Music Club (requires approval) - sample requests
  const musicRequests = new Map();
  
  musicRequests.set('req-sample-2', {
    _id: 'req-sample-2',
    clubId: 'club3',
    userId: 'user2',
    user: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@college.edu',
      role: 'club_head'
    },
    status: 'pending',
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    message: 'I play guitar and piano, and would like to collaborate with other musicians.'
  });
  
  membershipRequests.set('club3', musicRequests);
  
  console.log('🎭 Initialized sample membership requests for testing');
};

// Initialize sample data
initializeSampleMembershipRequests();

const mockAnnouncements = [
  {
    _id: 'ann1',
    title: 'Welcome to Programming Club!',
    content: 'We are excited to have you join our programming community. Get ready for amazing workshops and coding challenges!',
    clubId: 'club1',
    author: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'ann2',
    title: 'Photography Exhibition This Weekend',
    content: 'Don\'t miss our annual photography exhibition featuring amazing works from our club members.',
    clubId: 'club2',
    author: { _id: 'user2', firstName: 'Jane', lastName: 'Smith' },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'ann3',
    title: 'Music Club Equipment Update',
    content: 'We\'ve received new musical instruments! Come check them out at our next meeting.',
    clubId: 'club3',
    author: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'ann4',
    title: 'Debate Club Meeting Schedule',
    content: 'New meeting schedule: Every Wednesday at 4PM in Room 205. Topics for next week available on our board.',
    clubId: 'club4',
    author: { _id: 'user2', firstName: 'Jane', lastName: 'Smith' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'ann5',
    title: 'General Club Updates',
    content: 'Thank you to all club members for making this semester amazing! Keep up the great work.',
    clubId: 'club1',
    author: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
    createdAt: new Date().toISOString()
  }
];

// Auth routes
app.post('/api/auth/register', (req, res) => {
  console.log('🔐 REGISTER ROUTE HIT');
  console.log('📝 Request body received:', req.body);
  
  const { firstName, lastName, email, password, role } = req.body;
  
  // Validation
  if (!firstName || !lastName || !email || !password) {
    console.log('❌ Validation failed - missing required fields');
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      missing: {
        firstName: !firstName,
        lastName: !lastName,
        email: !email,
        password: !password
      }
    });
  }
  
  const newUser = {
    _id: 'user-' + Date.now(),
    firstName,
    lastName,
    email,
    role: role || 'student',
    password // Store password for login verification
  };
  
  // Store the registered user
  registeredUsers.set(email, newUser);
  
  console.log('✅ Registration successful for:', { ...newUser, password: '[HIDDEN]' });
  
  const token = 'demo-token-' + Date.now();
  const userResponse = { ...newUser, password: undefined }; // Remove password from response
  
  // Store user with token for /api/auth/me endpoint
  activeTokens.set(token, userResponse);
  
  res.status(201).json({
    success: true,
    token: token,
    user: userResponse,
    message: 'Registration successful'
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 LOGIN ROUTE HIT');
  console.log('📝 Request body received:', req.body);
  
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    console.log('❌ Login validation failed - missing credentials');
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      missing: {
        email: !email,
        password: !password
      }
    });
  }
  
  let user = null;
  let authMethod = 'none';
  
  // PRIORITY 1: Check registered users first
  if (registeredUsers.has(email)) {
    const registeredUser = registeredUsers.get(email);
    console.log('🔍 Found registered user:', { email, role: registeredUser.role });
    if (registeredUser.password === password) {
      user = { ...registeredUser, password: undefined }; // Remove password from response
      authMethod = 'registered';
      console.log('✅ Authenticated registered user');
    } else {
      console.log('❌ Password mismatch for registered user');
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
  } 
  // PRIORITY 2: Check predefined mock users (for admin access)
  else {
    const mockUser = mockUsers.find(u => u.email === email);
    if (mockUser) {
      user = mockUser;
      authMethod = 'mock';
      console.log('✅ Authenticated mock user:', user.role);
    } else {
      console.log('❌ Login failed - user not found in registered or mock users');
      console.log('📝 Registered users:', Array.from(registeredUsers.keys()));
      console.log('📝 Mock users:', mockUsers.map(u => u.email));
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please register first.'
      });
    }
  }
  
  console.log(`✅ Login successful for: ${user.firstName} ${user.lastName} (${user.email}) via ${authMethod}`);
  
  const token = 'demo-token-' + Date.now();
  
  // Store user with token for /api/auth/me endpoint
  activeTokens.set(token, user);
  
  res.json({
    success: true,
    token: token,
    user: user
  });
});

// Store for active tokens
const activeTokens = new Map();

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    console.log('❌ No authorization token provided');
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  // Get user from token
  let user = activeTokens.get(token);
  
  if (!user) {
    console.log('⚠️ Token not found in activeTokens:', token);
    console.log('🔍 Available tokens:', Array.from(activeTokens.keys()));
    
    // Check if this is a demo token pattern - create fallback session
    if (token.startsWith('demo-token')) {
      // Try to find registered user first, then use admin fallback
      let fallbackUser = null;
      
      // Check if we can find a registered user
      if (registeredUsers.size > 0) {
        const firstRegisteredUser = Array.from(registeredUsers.values())[0];
        fallbackUser = { ...firstRegisteredUser, password: undefined };
        console.log('🔄 Using fallback registered user:', fallbackUser.email);
      } else {
        // Use admin fallback
        fallbackUser = { 
          _id: 'user1', 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john@college.edu', 
          role: 'super_admin' 
        };
        console.log('🔄 Using fallback admin user for demo token');
      }
      
      // Store the fallback user for future requests
      activeTokens.set(token, fallbackUser);
      
      return res.json({
        success: true,
        user: fallbackUser
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  console.log('✅ Token found, returning user:', { id: user._id, email: user.email, role: user.role });
  
  res.json({
    success: true,
    user: user
  });
});

// Events routes
app.get('/api/events', (req, res) => {
  const { status } = req.query;
  let filteredEvents = mockEvents;
  
  if (status && status !== 'all') {
    filteredEvents = mockEvents.filter(event => event.status === status);
  }
  
  res.json({
    success: true,
    data: filteredEvents
  });
});

app.get('/api/events/user/my-events', (req, res) => {
  const { type, status } = req.query;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  let userEvents = [];
  
  if (type === 'organizing') {
    // Events organized by this user
    userEvents = mockEvents.filter(event => event.organizer._id === user._id);
  } else if (type === 'attending') {
    // Events user is attending
    userEvents = mockEvents.filter(event => 
      event.attendees && event.attendees.includes(user._id)
    );
  } else {
    // All user events (organizing + attending)
    const organizingEvents = mockEvents.filter(event => event.organizer._id === user._id);
    const attendingEvents = mockEvents.filter(event => 
      event.attendees && event.attendees.includes(user._id) && event.organizer._id !== user._id
    );
    userEvents = [...organizingEvents, ...attendingEvents];
  }
  
  // Apply status filter if provided
  if (status && status !== 'all') {
    userEvents = userEvents.filter(event => event.status === status);
  }
  
  res.json({
    success: true,
    data: userEvents
  });
});

app.post('/api/events', (req, res) => {
  const newEvent = {
    _id: 'event-' + Date.now(),
    ...req.body,
    organizer: mockUsers[0],
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

app.post('/api/events/:id/join', (req, res) => {
  const { id } = req.params;
  const event = mockEvents.find(e => e._id === id);
  
  if (event) {
    // Mock joining logic
    res.json({
      success: true,
      message: 'Successfully joined event'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
});

app.post('/api/events/:id/leave', (req, res) => {
  const { id } = req.params;
  const event = mockEvents.find(e => e._id === id);
  
  if (event) {
    // Mock leaving logic
    res.json({
      success: true,
      message: 'Successfully left event'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
});

// Clubs routes
app.get('/api/clubs', (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  // Combine mock clubs with created clubs and update member counts
  let allClubs = mockClubs.map(club => {
    const members = clubMembers.get(club._id) || new Set();
    
    // Find club head from admins
    let clubHead = null;
    if (club.admins && club.admins.length > 0) {
      const adminId = club.admins[0]; // Take first admin as club head
      clubHead = mockUsers.find(u => u._id === adminId);
      if (!clubHead) {
        clubHead = Array.from(registeredUsers.values()).find(u => u._id === adminId);
      }
    }
    
    return {
      ...club,
      memberCount: members.size,
      clubHead: clubHead ? {
        _id: clubHead._id,
        firstName: clubHead.firstName,
        lastName: clubHead.lastName,
        email: clubHead.email
      } : null
    };
  });
  
  // Add created clubs
  createdClubs.forEach(club => {
    const members = clubMembers.get(club._id) || new Set();
    
    // Find club head from admins
    let clubHead = null;
    if (club.admins && club.admins.length > 0) {
      const adminId = club.admins[0];
      clubHead = mockUsers.find(u => u._id === adminId);
      if (!clubHead) {
        clubHead = Array.from(registeredUsers.values()).find(u => u._id === adminId);
      }
    }
    
    allClubs.push({
      ...club,
      memberCount: members.size,
      clubHead: clubHead ? {
        _id: clubHead._id,
        firstName: clubHead.firstName,
        lastName: clubHead.lastName,
        email: clubHead.email
      } : null
    });
  });
  
  // Apply filters
  if (category && category !== 'all') {
    allClubs = allClubs.filter(club => 
      club.category?._id === category || club.category === category
    );
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    allClubs = allClubs.filter(club =>
      club.name.toLowerCase().includes(searchLower) ||
      club.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const totalClubs = allClubs.length;
  const totalPages = Math.ceil(totalClubs / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedClubs = allClubs.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedClubs,
    pagination: {
      currentPage: pageNum,
      pages: totalPages,
      totalItems: totalClubs,
      hasNext: pageNum < totalPages,
      hasPrevious: pageNum > 1
    }
  });
});

app.get('/api/clubs/user/my-clubs', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2]; // Default to student
  
  console.log('👤 User requesting clubs:', { id: user._id, role: user.role, email: user.email });
  
  let userClubs = [];
  
  // Combine mock clubs with created clubs
  const allClubs = [...mockClubs];
  
  // Add created clubs
  createdClubs.forEach(club => {
    // Update member count based on actual members
    const members = clubMembers.get(club._id) || new Set();
    club.memberCount = members.size;
    allClubs.push(club);
  });
  
  if (user.role === 'super_admin') {
    // Super admin sees all clubs
    userClubs = allClubs;
    console.log('🔧 Super admin sees all clubs:', userClubs.length);
  } else if (user.role === 'club_head') {
    // Club head sees clubs they admin and clubs they're members of
    userClubs = allClubs.filter(club => {
      const isAdmin = club.admins && club.admins.includes(user._id);
      const isMember = clubMembers.get(club._id)?.has(user._id);
      const isCreator = club.contactEmail === user.email; // Created clubs
      return isAdmin || isMember || isCreator;
    });
    console.log('👑 Club head sees clubs:', userClubs.length);
  } else {
    // Students see clubs they're members of or created
    userClubs = allClubs.filter(club => {
      const isMember = clubMembers.get(club._id)?.has(user._id);
      const isCreator = club.contactEmail === user.email; // Created clubs
      return isMember || isCreator;
    });
    
    // If no clubs found, add user to first 2 mock clubs for demo
    if (userClubs.length === 0) {
      const firstTwoClubs = mockClubs.slice(0, 2);
      firstTwoClubs.forEach(club => {
        if (!clubMembers.has(club._id)) {
          clubMembers.set(club._id, new Set());
        }
        clubMembers.get(club._id).add(user._id);
      });
      userClubs = firstTwoClubs;
      console.log('📚 Added student to first 2 clubs for demo');
    }
    console.log('🎓 Student sees clubs:', userClubs.length);
  }
  
  res.json({
    success: true,
    data: userClubs
  });
});

app.get('/api/clubs/:id', (req, res) => {
  const { id } = req.params;
  
  // Check both mock clubs and created clubs
  let club = mockClubs.find(c => c._id === id);
  let isCreatedClub = false;
  
  if (!club) {
    club = createdClubs.get(id);
    isCreatedClub = true;
  }
  
  if (club) {
    // Get actual members for this club
    const memberIds = clubMembers.get(id) || new Set();
    const members = [];
    
    // Get member details from both mock users and registered users
    memberIds.forEach(memberId => {
      let member = mockUsers.find(u => u._id === memberId);
      if (!member) {
        member = Array.from(registeredUsers.values()).find(u => u._id === memberId);
      }
      if (member) {
        members.push({
          _id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          role: member.role
        });
      }
    });
    
    // Find club head from admins
    let clubHead = null;
    if (club.admins && club.admins.length > 0) {
      const adminId = club.admins[0]; // Take first admin as club head
      clubHead = mockUsers.find(u => u._id === adminId);
      if (!clubHead) {
        clubHead = Array.from(registeredUsers.values()).find(u => u._id === adminId);
      }
    }
    
    // Get club-specific announcements
    const clubAnnouncements = mockAnnouncements.filter(a => a.clubId === id);
    
    // Get club-specific events (handle both string and object clubId formats)
    const clubEvents = mockEvents.filter(e => {
      const eventClubId = typeof e.clubId === 'object' ? e.clubId._id : e.clubId;
      return eventClubId === id;
    }).slice(0, 3);
    
    const clubData = {
      ...club,
      memberCount: memberIds.size,
      members: members,
      clubHead: clubHead ? {
        _id: clubHead._id,
        firstName: clubHead.firstName,
        lastName: clubHead.lastName,
        email: clubHead.email
      } : null,
      announcements: clubAnnouncements,
      upcomingEvents: clubEvents,
      isCreated: isCreatedClub
    };
    
    console.log(`📋 Club details for ${club.name}: ${members.length} members, ${clubAnnouncements.length} announcements, ${clubEvents.length} events`);
    
    res.json({
      success: true,
      data: clubData
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    });
  }
});

app.post('/api/clubs', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  const clubId = 'club-' + Date.now();
  const newClub = {
    _id: clubId,
    ...req.body,
    createdBy: user._id,
    createdAt: new Date().toISOString(),
    admins: [user._id],
    memberCount: 1
  };
  
  // Store the created club
  createdClubs.set(clubId, newClub);
  
  // Initialize members set with creator
  clubMembers.set(clubId, new Set([user._id]));
  
  console.log('🏗️ Club created:', { 
    name: newClub.name, 
    id: clubId, 
    creator: user.email,
    members: 1
  });
  
  res.status(201).json({
    success: true,
    data: newClub,
    message: 'Club created successfully'
  });
});

// Delete club
app.delete('/api/clubs/:clubId', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  const { clubId } = req.params;
  
  console.log(`🗑️ Attempting to delete club ${clubId} by user ${user.email}`);
  
  // Check if user has permission to delete
  let canDelete = false;
  let clubToDelete = null;
  
  // Check if it's a mock club and user is super admin or club admin
  const mockClub = mockClubs.find(c => c._id === clubId);
  if (mockClub) {
    if (user.role === 'super_admin' || (mockClub.admins && mockClub.admins.includes(user._id))) {
      canDelete = true;
      clubToDelete = mockClub;
    }
  }
  
  // Check if it's a created club and user is super admin or creator/admin
  if (createdClubs.has(clubId)) {
    const createdClub = createdClubs.get(clubId);
    if (user.role === 'super_admin' || createdClub.createdBy === user._id || 
        (createdClub.admins && createdClub.admins.includes(user._id))) {
      canDelete = true;
      clubToDelete = createdClub;
    }
  }
  
  if (!canDelete || !clubToDelete) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only club admins or super admins can delete clubs.'
    });
  }
  
  // For mock clubs, we can't actually delete them, so just return success
  if (mockClub) {
    console.log(`⚠️ Cannot delete mock club ${clubId}, but returning success for demo`);
    return res.json({
      success: true,
      message: 'Mock club deletion simulated successfully'
    });
  }
  
  // Delete created club
  if (createdClubs.has(clubId)) {
    createdClubs.delete(clubId);
    clubMembers.delete(clubId);
    console.log(`✅ Deleted created club ${clubId}`);
    
    return res.json({
      success: true,
      message: 'Club deleted successfully'
    });
  }
  
  res.status(404).json({
    success: false,
    message: 'Club not found'
  });
});

// Categories routes
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { _id: 'cat1', name: 'Technology', color: '#2196F3' },
      { _id: 'cat2', name: 'Arts', color: '#FF9800' },
      { _id: 'cat3', name: 'Sports', color: '#4CAF50' },
      { _id: 'cat4', name: 'Academic', color: '#9C27B0' },
      { _id: 'cat5', name: 'Social', color: '#FF5722' }
    ]
  });
});

// Announcements routes
app.get('/api/announcements', (req, res) => {
  res.json({
    success: true,
    data: mockAnnouncements
  });
});

app.post('/api/announcements', (req, res) => {
  const newAnnouncement = {
    _id: 'ann-' + Date.now(),
    ...req.body,
    author: mockUsers[0],
    createdAt: new Date().toISOString()
  };
  
  mockAnnouncements.push(newAnnouncement);
  
  res.status(201).json({
    success: true,
    data: newAnnouncement,
    message: 'Announcement created successfully'
  });
});

// Dashboard routes
app.get('/api/dashboard/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  const totalClubs = mockClubs.length + createdClubs.size;
  const totalEvents = mockEvents.length;
  const totalMembers = mockUsers.length + registeredUsers.size;
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming').length;
  
  let stats = {
    totalClubs,
    totalEvents,
    totalMembers,
    upcomingEvents
  };
  
  // Add role-specific stats
  if (user.role === 'super_admin') {
    stats.adminClubs = totalClubs;
    stats.pendingApprovals = 0; // Could track club approval requests
    stats.activeUsers = registeredUsers.size;
    stats.recentRegistrations = Array.from(registeredUsers.values())
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  } else if (user.role === 'club_head') {
    // Count clubs this user administers
    const adminClubs = mockClubs.filter(club => club.admins?.includes(user._id)).length +
                      Array.from(createdClubs.values()).filter(club => club.admins?.includes(user._id)).length;
    stats.adminClubs = adminClubs;
    stats.organizingEvents = mockEvents.filter(e => e.organizer._id === user._id).length;
  } else {
    // Student stats
    const memberClubs = Array.from(clubMembers.entries())
      .filter(([clubId, members]) => members.has(user._id)).length;
    stats.joinedClubs = memberClubs;
    stats.attendingEvents = 0; // Could track event attendance
  }
  
  console.log('📊 Dashboard stats for', user.role + ':', stats);
  
  res.json({
    success: true,
    data: stats
  });
});

// Recent announcements
app.get('/api/announcements/recent', (req, res) => {
  res.json({
    success: true,
    data: mockAnnouncements.slice(0, 5) // Return first 5 recent announcements
  });
});

// Keep only one dashboard overview route - it's already defined above

// Admin-specific endpoints
app.get('/api/admin/users', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  const allUsers = [
    ...mockUsers,
    ...Array.from(registeredUsers.values()).map(u => ({ ...u, password: undefined }))
  ];
  
  const paginatedUsers = allUsers.slice(offset, offset + limit);
  const totalPages = Math.ceil(allUsers.length / limit);
  
  res.json({
    success: true,
    data: paginatedUsers,
    pagination: {
      currentPage: page,
      pages: totalPages,
      totalPages,
      totalItems: allUsers.length,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  });
});

app.get('/api/admin/clubs', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  const allClubs = [...mockClubs.map(club => {
    const members = clubMembers.get(club._id) || new Set();
    
    // Find club head from admins
    let clubHead = null;
    if (club.admins && club.admins.length > 0) {
      const adminId = club.admins[0]; // Take first admin as club head
      clubHead = mockUsers.find(u => u._id === adminId);
      if (!clubHead) {
        clubHead = Array.from(registeredUsers.values()).find(u => u._id === adminId);
      }
    }
    
    return {
      ...club,
      memberCount: members.size,
      clubHead: clubHead ? {
        _id: clubHead._id,
        firstName: clubHead.firstName,
        lastName: clubHead.lastName,
        email: clubHead.email
      } : null,
      isActive: true
    };
  })];
  
  // Add created clubs
  createdClubs.forEach(club => {
    const members = clubMembers.get(club._id) || new Set();
    
    // Find club head from admins
    let clubHead = null;
    if (club.admins && club.admins.length > 0) {
      const adminId = club.admins[0];
      clubHead = mockUsers.find(u => u._id === adminId);
      if (!clubHead) {
        clubHead = Array.from(registeredUsers.values()).find(u => u._id === adminId);
      }
    }
    
    allClubs.push({
      ...club,
      memberCount: members.size,
      clubHead: clubHead ? {
        _id: clubHead._id,
        firstName: clubHead.firstName,
        lastName: clubHead.lastName,
        email: clubHead.email
      } : null,
      isActive: true
    });
  });
  
  res.json({
    success: true,
    data: allClubs
  });
});

// Admin dashboard stats
app.get('/api/admin/dashboard', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  const totalUsers = mockUsers.length + registeredUsers.size;
  const totalClubs = mockClubs.length + createdClubs.size;
  const totalEvents = mockEvents.length;
  const activeEvents = mockEvents.filter(e => e.status === 'upcoming').length;
  
  res.json({
    success: true,
    data: {
      totalUsers,
      totalClubs,
      totalEvents,
      activeEvents,
      recentRegistrations: Array.from(registeredUsers.values()).slice(-5),
      recentClubs: Array.from(createdClubs.values()).slice(-3)
    }
  });
});

// Get clubs without head
app.get('/api/admin/clubs/no-head', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  // Find clubs without heads (for demo purposes, return empty array as our mock clubs have admins)
  const clubsWithoutHead = [];
  
  res.json({
    success: true,
    data: clubsWithoutHead
  });
});

// Promote user to club head
app.put('/api/admin/promote-club-head', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  const { userId, clubId } = req.body;
  
  // In a real app, you'd update the database
  // For demo purposes, we'll just return success
  console.log(`🔧 Admin promoting user ${userId} to club head of ${clubId}`);
  
  res.json({
    success: true,
    message: 'User promoted to club head successfully'
  });
});

// Update user role
app.put('/api/admin/users/:userId/role', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  const { userId } = req.params;
  const { role, clubId } = req.body;
  
  console.log(`🔧 Admin updating user ${userId} role to ${role}${clubId ? ` for club ${clubId}` : ''}`);
  
  // Update user role in mock users
  const mockUserIndex = mockUsers.findIndex(u => u._id === userId);
  if (mockUserIndex !== -1) {
    mockUsers[mockUserIndex].role = role;
    console.log(`✅ Updated mock user ${userId} role to ${role}`);
  }
  
  // Update user role in registered users
  if (registeredUsers.has(userId)) {
    const registeredUser = registeredUsers.get(userId);
    registeredUser.role = role;
    registeredUsers.set(userId, registeredUser);
    console.log(`✅ Updated registered user ${userId} role to ${role}`);
  }
  
  // Update any active tokens for this user
  for (const [tokenKey, tokenUser] of activeTokens.entries()) {
    if (tokenUser._id === userId || tokenUser.id === userId) {
      tokenUser.role = role;
      activeTokens.set(tokenKey, tokenUser);
      console.log(`✅ Updated active token for user ${userId} with new role ${role}`);
    }
  }
  
  // Handle club head role assignment
  if (role === 'club_head') {
    // First, remove user from any existing club admin roles
    mockClubs.forEach(club => {
      const adminIndex = club.admins?.indexOf(userId);
      if (adminIndex !== -1) {
        club.admins.splice(adminIndex, 1);
        console.log(`🗑️ Removed user ${userId} as admin from club ${club._id}`);
      }
    });
    
    createdClubs.forEach(club => {
      const adminIndex = club.admins?.indexOf(userId);
      if (adminIndex !== -1) {
        club.admins.splice(adminIndex, 1);
        createdClubs.set(club._id, club);
        console.log(`🗑️ Removed user ${userId} as admin from created club ${club._id}`);
      }
    });
    
    // If a specific club is selected, add user as admin to that club
    if (clubId) {
      const club = mockClubs.find(c => c._id === clubId);
      if (club) {
        if (!club.admins) club.admins = [];
        if (!club.admins.includes(userId)) {
          club.admins.unshift(userId); // Add as first admin (primary club head)
          console.log(`✅ Added user ${userId} as primary admin to club ${clubId}`);
        }
      }
      
      // Also check created clubs
      if (createdClubs.has(clubId)) {
        const createdClub = createdClubs.get(clubId);
        if (!createdClub.admins) createdClub.admins = [];
        if (!createdClub.admins.includes(userId)) {
          createdClub.admins.unshift(userId); // Add as first admin (primary club head)
          createdClubs.set(clubId, createdClub);
          console.log(`✅ Added user ${userId} as primary admin to created club ${clubId}`);
        }
      }
    }
  } else if (role === 'student') {
    // If demoting from club head to student, remove from all club admin roles
    mockClubs.forEach(club => {
      const adminIndex = club.admins?.indexOf(userId);
      if (adminIndex !== -1) {
        club.admins.splice(adminIndex, 1);
        console.log(`🗑️ Demoted: Removed user ${userId} as admin from club ${club._id}`);
      }
    });
    
    createdClubs.forEach(club => {
      const adminIndex = club.admins?.indexOf(userId);
      if (adminIndex !== -1) {
        club.admins.splice(adminIndex, 1);
        createdClubs.set(club._id, club);
        console.log(`🗑️ Demoted: Removed user ${userId} as admin from created club ${club._id}`);
      }
    });
  }
  
  res.json({
    success: true,
    message: `User role updated to ${role} successfully`,
    data: {
      userId,
      newRole: role,
      clubId: clubId || null
    }
  });
});

// Delete user
app.delete('/api/admin/users/:userId', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  const { userId } = req.params;
  
  console.log(`🗑️ Admin deleting user ${userId}`);
  
  // In a real app, you'd delete from database
  // For demo purposes, we'll just return success
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Assign club head
app.put('/api/admin/clubs/:clubId/assign-head', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  const { clubId } = req.params;
  const { userId } = req.body;
  
  console.log(`👥 Admin assigning user ${userId} as head of club ${clubId}`);
  
  // In a real app, you'd update the database
  // For demo purposes, we'll just return success
  res.json({
    success: true,
    message: 'Club head assigned successfully'
  });
});

// User event management routes - must come before catch-all
app.get('/api/events/user/attending', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  // Return events user is attending
  const attendingEvents = mockEvents.filter(event => 
    event.attendees && event.attendees.includes(user._id)
  );
  
  res.json({
    success: true,
    data: attendingEvents
  });
});

app.post('/api/events/:eventId/join', (req, res) => {
  const { eventId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  const event = mockEvents.find(e => e._id === eventId);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  if (!event.attendees) {
    event.attendees = [];
  }
  
  if (!event.attendees.includes(user._id)) {
    event.attendees.push(user._id);
  }
  
  res.json({
    success: true,
    message: 'Successfully joined event',
    data: event
  });
});

app.delete('/api/events/:eventId/leave', (req, res) => {
  const { eventId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  const event = mockEvents.find(e => e._id === eventId);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  if (event.attendees) {
    event.attendees = event.attendees.filter(attendeeId => attendeeId !== user._id);
  }
  
  res.json({
    success: true,
    message: 'Successfully left event',
    data: event
  });
});

// Dashboard and stats routes
app.get('/api/dashboard/overview', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  // Get user's clubs
  const allClubs = [...mockClubs];
  createdClubs.forEach(club => {
    const members = clubMembers.get(club._id) || new Set();
    allClubs.push({ ...club, memberCount: members.size });
  });
  
  let myClubs = [];
  if (user.role === 'super_admin') {
    myClubs = allClubs.slice(0, 4);
  } else {
    myClubs = allClubs.filter(club => {
      const isMember = clubMembers.get(club._id)?.has(user._id);
      const isAdmin = club.admins?.includes(user._id);
      const isCreator = club.contactEmail === user.email;
      return isMember || isAdmin || isCreator;
    }).slice(0, 3);
  }
  
  const stats = {
    joinedClubs: myClubs.length,
    attendingEvents: mockEvents.filter(e => e.attendees?.includes(user._id)).length,
    organizingEvents: user.role === 'super_admin' || user.role === 'club_head' ? mockEvents.length : 0,
    totalMembers: mockUsers.length + registeredUsers.size
  };
  
  res.json({
    success: true,
    data: {
      user: user,
      myClubs: myClubs,
      upcomingEvents: mockEvents.filter(e => e.status === 'upcoming').slice(0, 3),
      recentAnnouncements: mockAnnouncements.slice(0, 3),
      stats: stats
    }
  });
});

// Club-specific routes - must come before catch-all
app.get('/api/clubs/:clubId/announcements', (req, res) => {
  const { clubId } = req.params;
  const clubAnnouncements = mockAnnouncements.filter(a => a.clubId === clubId);
  
  res.json({
    success: true,
    data: clubAnnouncements
  });
});

app.get('/api/events/club/:clubId', (req, res) => {
  const { clubId } = req.params;
  const { status = 'upcoming', limit = 10 } = req.query;
  
  let clubEvents = mockEvents.filter(e => e.clubId._id === clubId);
  
  if (status !== 'all') {
    clubEvents = clubEvents.filter(e => e.status === status);
  }
  
  if (limit) {
    clubEvents = clubEvents.slice(0, parseInt(limit));
  }
  
  res.json({
    success: true,
    data: clubEvents
  });
});

// Club membership management
app.post('/api/clubs/:clubId/join', (req, res) => {
  const { clubId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user is already a member
  if (clubMembers.has(clubId) && clubMembers.get(clubId).has(user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member of this club'
    });
  }
  
  // Check if user already has a pending request
  if (membershipRequests.has(clubId)) {
    const clubRequests = membershipRequests.get(clubId);
    const existingRequest = Array.from(clubRequests.values()).find(req => req.userId === user._id && req.status === 'pending');
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending membership request for this club'
      });
    }
  }
  
  // Find the club to check its settings
  let club = mockClubs.find(c => c._id === clubId);
  if (!club) {
    club = createdClubs.get(clubId);
  }
  
  if (!club) {
    return res.status(404).json({
      success: false,
      message: 'Club not found'
    });
  }
  
  // Check if club allows joining
  if (club.allowJoining === false) {
    return res.status(403).json({
      success: false,
      message: 'This club is not currently accepting new members'
    });
  }
  
  // If club requires approval, create a membership request
  if (club.requireApproval) {
    // Initialize membership requests for this club if not exists
    if (!membershipRequests.has(clubId)) {
      membershipRequests.set(clubId, new Map());
    }
    
    const requestId = 'req-' + Date.now() + '-' + user._id;
    const membershipRequest = {
      _id: requestId,
      clubId: clubId,
      userId: user._id,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      status: 'pending',
      requestedAt: new Date().toISOString(),
      message: req.body.message || ''
    };
    
    membershipRequests.get(clubId).set(requestId, membershipRequest);
    
    console.log(`📝 Membership request created: ${user.firstName} ${user.lastName} -> ${club.name}`);
    
    res.json({
      success: true,
      message: 'Membership request submitted successfully. Please wait for approval.',
      requiresApproval: true,
      requestId: requestId
    });
  } else {
    // Direct joining (no approval required)
    if (!clubMembers.has(clubId)) {
      clubMembers.set(clubId, new Set());
    }
    
    clubMembers.get(clubId).add(user._id);
    
    console.log(`✅ User ${user.firstName} ${user.lastName} joined ${club.name} directly`);
    
    res.json({
      success: true,
      message: 'Successfully joined club',
      requiresApproval: false
    });
  }
});

app.delete('/api/clubs/:clubId/leave', (req, res) => {
  const { clubId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token) || mockUsers[2];
  
  if (clubMembers.has(clubId)) {
    clubMembers.get(clubId).delete(user._id);
  }
  
  res.json({
    success: true,
    message: 'Successfully left club'
  });
});

// Get membership requests for a club
app.get('/api/clubs/:clubId/membership-requests', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has permission to view membership requests (club admin or super admin)
  let hasPermission = false;
  
  if (user.role === 'super_admin') {
    hasPermission = true;
  } else {
    // Check if user is admin of this club
    const club = mockClubs.find(c => c._id === clubId) || createdClubs.get(clubId);
    if (club && club.admins && club.admins.includes(user._id)) {
      hasPermission = true;
    }
  }
  
  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only club admins can view membership requests.'
    });
  }
  
  // Get pending membership requests for this club
  const clubRequests = membershipRequests.get(clubId) || new Map();
  const pendingRequests = Array.from(clubRequests.values()).filter(req => req.status === 'pending');
  
  console.log(`📋 Found ${pendingRequests.length} pending membership requests for club ${clubId}`);
  
  res.json({
    success: true,
    data: pendingRequests
  });
});

// Accept membership request
app.put('/api/clubs/:clubId/membership-requests/:requestId/accept', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId, requestId } = req.params;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has permission to accept requests (club admin or super admin)
  let hasPermission = false;
  
  if (user.role === 'super_admin') {
    hasPermission = true;
  } else {
    // Check if user is admin of this club
    const club = mockClubs.find(c => c._id === clubId) || createdClubs.get(clubId);
    if (club && club.admins && club.admins.includes(user._id)) {
      hasPermission = true;
    }
  }
  
  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only club admins can accept membership requests.'
    });
  }
  
  // Find the membership request
  const clubRequests = membershipRequests.get(clubId);
  if (!clubRequests || !clubRequests.has(requestId)) {
    return res.status(404).json({
      success: false,
      message: 'Membership request not found'
    });
  }
  
  const request = clubRequests.get(requestId);
  
  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This request has already been processed'
    });
  }
  
  // Add user to club members
  if (!clubMembers.has(clubId)) {
    clubMembers.set(clubId, new Set());
  }
  
  clubMembers.get(clubId).add(request.userId);
  
  // Update request status
  request.status = 'approved';
  request.approvedAt = new Date().toISOString();
  request.approvedBy = user._id;
  clubRequests.set(requestId, request);
  
  // Remove from rejected requests if they were previously rejected
  if (rejectedRequests.has(clubId)) {
    rejectedRequests.get(clubId).delete(request.userId);
  }
  
  console.log(`✅ Accepted membership request: ${request.user.firstName} ${request.user.lastName} -> Club ${clubId}`);
  
  res.json({
    success: true,
    message: 'Membership request accepted',
    data: {
      requestId: requestId,
      userId: request.userId,
      clubId: clubId,
      approvedAt: request.approvedAt
    }
  });
});

// Reject membership request
app.put('/api/clubs/:clubId/membership-requests/:requestId/reject', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId, requestId } = req.params;
  const { reason } = req.body;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has permission to reject requests (club admin or super admin)
  let hasPermission = false;
  
  if (user.role === 'super_admin') {
    hasPermission = true;
  } else {
    // Check if user is admin of this club
    const club = mockClubs.find(c => c._id === clubId) || createdClubs.get(clubId);
    if (club && club.admins && club.admins.includes(user._id)) {
      hasPermission = true;
    }
  }
  
  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only club admins can reject membership requests.'
    });
  }
  
  // Find the membership request
  const clubRequests = membershipRequests.get(clubId);
  if (!clubRequests || !clubRequests.has(requestId)) {
    return res.status(404).json({
      success: false,
      message: 'Membership request not found'
    });
  }
  
  const request = clubRequests.get(requestId);
  
  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This request has already been processed'
    });
  }
  
  // Update request status
  request.status = 'rejected';
  request.rejectedAt = new Date().toISOString();
  request.rejectedBy = user._id;
  request.rejectionReason = reason || '';
  clubRequests.set(requestId, request);
  
  // Track rejection for re-application logic (optional - allows immediate re-application)
  if (!rejectedRequests.has(clubId)) {
    rejectedRequests.set(clubId, new Set());
  }
  rejectedRequests.get(clubId).add(request.userId);
  
  console.log(`❌ Rejected membership request: ${request.user.firstName} ${request.user.lastName} -> Club ${clubId} (Reason: ${reason || 'No reason provided'})`);
  
  res.json({
    success: true,
    message: 'Membership request rejected',
    data: {
      requestId: requestId,
      userId: request.userId,
      clubId: clubId,
      rejectedAt: request.rejectedAt,
      reason: reason || ''
    }
  });
});

// Check user's membership status for a club
app.get('/api/clubs/:clubId/membership-status', (req, res) => {
  const { clubId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  const status = {
    isMember: false,
    hasPendingRequest: false,
    wasRejected: false,
    canApply: true,
    lastRequestId: null,
    lastRequestStatus: null
  };
  
  // Check if user is already a member
  if (clubMembers.has(clubId) && clubMembers.get(clubId).has(user._id)) {
    status.isMember = true;
    status.canApply = false;
  }
  
  // Check for pending or recent requests
  if (membershipRequests.has(clubId)) {
    const clubRequests = membershipRequests.get(clubId);
    const userRequests = Array.from(clubRequests.values()).filter(req => req.userId === user._id);
    
    if (userRequests.length > 0) {
      // Get the most recent request
      const latestRequest = userRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))[0];
      status.lastRequestId = latestRequest._id;
      status.lastRequestStatus = latestRequest.status;
      
      if (latestRequest.status === 'pending') {
        status.hasPendingRequest = true;
        status.canApply = false;
      } else if (latestRequest.status === 'rejected') {
        status.wasRejected = true;
        status.canApply = true; // Allow re-application after rejection
      } else if (latestRequest.status === 'approved') {
        status.isMember = true;
        status.canApply = false;
      }
    }
  }
  
  res.json({
    success: true,
    data: status
  });
});

// Get all membership requests for a club (with filtering)
app.get('/api/clubs/:clubId/all-membership-requests', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  const { status: statusFilter } = req.query; // 'pending', 'approved', 'rejected', or 'all'
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has permission to view membership requests (club admin or super admin)
  let hasPermission = false;
  
  if (user.role === 'super_admin') {
    hasPermission = true;
  } else {
    // Check if user is admin of this club
    const club = mockClubs.find(c => c._id === clubId) || createdClubs.get(clubId);
    if (club && club.admins && club.admins.includes(user._id)) {
      hasPermission = true;
    }
  }
  
  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only club admins can view membership requests.'
    });
  }
  
  // Get membership requests for this club
  const clubRequests = membershipRequests.get(clubId) || new Map();
  let allRequests = Array.from(clubRequests.values());
  
  // Apply status filter
  if (statusFilter && statusFilter !== 'all') {
    allRequests = allRequests.filter(req => req.status === statusFilter);
  }
  
  // Sort by request date (newest first)
  allRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
  
  console.log(`📋 Found ${allRequests.length} membership requests for club ${clubId} (filter: ${statusFilter || 'all'})`);
  
  res.json({
    success: true,
    data: allRequests,
    total: allRequests.length
  });
});

// Handle membership request action
app.put('/api/membership-requests/:requestId', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { requestId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  console.log(`📝 ${action === 'approve' ? 'Approving' : 'Rejecting'} membership request ${requestId}`);
  
  res.json({
    success: true,
    message: `Membership request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
  });
});

// Remove member from club
app.delete('/api/clubs/:clubId/members/:memberId', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId, memberId } = req.params;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Remove member from club members set
  if (clubMembers.has(clubId)) {
    const members = clubMembers.get(clubId);
    members.delete(memberId);
    clubMembers.set(clubId, members);
  }
  
  console.log(`👤 Removing member ${memberId} from club ${clubId}`);
  
  res.json({
    success: true,
    message: 'Member removed successfully'
  });
});

// Get club members with detailed info
app.get('/api/clubs/:clubId/members', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Get members from club members set
  const memberIds = clubMembers.get(clubId) || new Set();
  const memberDetails = [];
  
  console.log(`🔍 Club ${clubId} member IDs:`, Array.from(memberIds));
  console.log(`🔍 Registered users available:`, Array.from(registeredUsers.values()).map(u => u._id));
  
  // Get member details from mock users and registered users
  memberIds.forEach(memberId => {
    let member = mockUsers.find(u => u._id === memberId);
    if (!member) {
      // Search registered users by ID (since registeredUsers is keyed by email)
      member = Array.from(registeredUsers.values()).find(u => u._id === memberId);
    }
    if (member) {
      console.log(`✅ Found member:`, member.firstName, member.lastName);
      memberDetails.push({
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        role: member.role,
        joinedAt: new Date().toISOString() // Mock join date
      });
    } else {
      console.log(`❌ Member not found for ID:`, memberId);
    }
  });
  
  res.json({
    success: true,
    data: memberDetails
  });
});

// Create announcement for a club
app.post('/api/clubs/:clubId/announcements', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  const { title, content } = req.body;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Create new announcement
  const newAnnouncement = {
    _id: `ann-${Date.now()}`,
    title,
    content,
    clubId,
    author: {
      _id: user._id || user.id,
      firstName: user.firstName,
      lastName: user.lastName
    },
    createdAt: new Date().toISOString()
  };
  
  // Add to mock announcements
  mockAnnouncements.push(newAnnouncement);
  
  console.log(`📢 New announcement created for club ${clubId}: ${title}`);
  
  res.status(201).json({
    success: true,
    data: newAnnouncement,
    message: 'Announcement created successfully'
  });
});

// Toggle club joining status
app.put('/api/clubs/:clubId/toggle-joining', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Find club in mock data or created clubs
  let club = mockClubs.find(c => c._id === clubId);
  if (!club) {
    club = createdClubs.get(clubId);
  }
  
  if (!club) {
    return res.status(404).json({
      success: false,
      message: 'Club not found'
    });
  }
  
  // Toggle joining status (for demo purposes, we'll assume it's always enabled)
  const newJoiningStatus = !(club.allowJoining !== false); // Default to true if not set
  
  console.log(`🔄 Toggling joining status for club ${clubId}: ${newJoiningStatus ? 'enabled' : 'disabled'}`);
  
  // Update the club (in real app, this would update database)
  if (mockClubs.find(c => c._id === clubId)) {
    const clubIndex = mockClubs.findIndex(c => c._id === clubId);
    mockClubs[clubIndex].allowJoining = newJoiningStatus;
  } else if (createdClubs.has(clubId)) {
    const clubData = createdClubs.get(clubId);
    clubData.allowJoining = newJoiningStatus;
    createdClubs.set(clubId, clubData);
  }
  
  res.json({
    success: true,
    data: {
      clubId,
      allowJoining: newJoiningStatus
    },
    message: `Club joining ${newJoiningStatus ? 'enabled' : 'disabled'} successfully`
  });
});

// Get club settings
app.get('/api/clubs/:clubId/settings', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Find club
  let club = mockClubs.find(c => c._id === clubId);
  if (!club) {
    club = createdClubs.get(clubId);
  }
  
  if (!club) {
    return res.status(404).json({
      success: false,
      message: 'Club not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      allowJoining: club.allowJoining !== false, // Default to true
      requireApproval: club.requireApproval || false,
      maxMembers: club.maxMembers || null
    }
  });
});

// Update club settings
app.put('/api/clubs/:clubId/settings', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  const { allowJoining, requireApproval, maxMembers } = req.body;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  console.log(`⚙️ Updating settings for club ${clubId}:`, { allowJoining, requireApproval, maxMembers });
  
  // Update settings (in real app, this would update database)
  let club = mockClubs.find(c => c._id === clubId);
  if (club) {
    const clubIndex = mockClubs.findIndex(c => c._id === clubId);
    mockClubs[clubIndex] = { ...club, allowJoining, requireApproval, maxMembers };
  } else if (createdClubs.has(clubId)) {
    const clubData = createdClubs.get(clubId);
    createdClubs.set(clubId, { ...clubData, allowJoining, requireApproval, maxMembers });
  }
  
  res.json({
    success: true,
    message: 'Club settings updated successfully'
  });
});

// Admin delete club
app.delete('/api/admin/clubs/:clubId', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { clubId } = req.params;
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  console.log(`🗑️ Admin deleting club ${clubId}`);
  
  // Check if it's a mock club
  const mockClubIndex = mockClubs.findIndex(c => c._id === clubId);
  if (mockClubIndex !== -1) {
    // For demo purposes, don't actually delete mock clubs
    console.log(`⚠️ Cannot delete mock club ${clubId}, but returning success for demo`);
    return res.json({
      success: true,
      message: 'Mock club deletion simulated successfully (mock clubs cannot be permanently deleted)'
    });
  }
  
  // Delete created club
  if (createdClubs.has(clubId)) {
    const clubName = createdClubs.get(clubId).name;
    createdClubs.delete(clubId);
    clubMembers.delete(clubId);
    
    console.log(`✅ Admin deleted created club: ${clubName}`);
    
    return res.json({
      success: true,
      message: `Club "${clubName}" deleted successfully`
    });
  }
  
  res.status(404).json({
    success: false,
    message: 'Club not found'
  });
});

// Get clubs that a specific user is a member of (for role assignment)
app.get('/api/admin/users/:userId/member-clubs', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const user = activeTokens.get(token);
  const { userId } = req.params;
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin required.'
    });
  }
  
  // Find clubs where this user is a member
  const userClubs = [];
  
  // Check mock clubs
  mockClubs.forEach(club => {
    const members = clubMembers.get(club._id) || new Set();
    if (members.has(userId)) {
      userClubs.push({
        ...club,
        memberCount: members.size
      });
    }
  });
  
  // Check created clubs
  createdClubs.forEach(club => {
    const members = clubMembers.get(club._id) || new Set();
    if (members.has(userId)) {
      userClubs.push({
        ...club,
        memberCount: members.size
      });
    }
  });
  
  console.log(`📋 User ${userId} is a member of ${userClubs.length} clubs:`, userClubs.map(c => c.name));
  
  res.json({
    success: true,
    data: userClubs
  });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Standalone Backend Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Events API: http://localhost:${PORT}/api/events`);
  console.log(`🏠 Clubs API: http://localhost:${PORT}/api/clubs`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});

module.exports = app;
