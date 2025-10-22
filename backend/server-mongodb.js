const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Club = require('./models/Club');
const ClubMember = require('./models/ClubMember');
const MembershipRequest = require('./models/MembershipRequest');
const Event = require('./models/Event');
const Announcement = require('./models/Announcement');
const Category = require('./models/Category');

const app = express();

// Enhanced logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔷 [${timestamp}] ${req.method} ${req.originalUrl}`);
  
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
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize sample data if database is empty
    await initializeSampleData();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize comprehensive sample data
const initializeSampleData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Initializing comprehensive sample data...');
      
      // Create comprehensive sample users with complete profiles
      const users = [
        {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@college.edu',
          password: 'admin123',
          role: 'super_admin',
          studentId: 'ADM001',
          year: 'Admin',
          major: 'Administration'
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@college.edu',
          password: 'password123',
          role: 'super_admin',
          studentId: 'STU001',
          year: '4th Year',
          major: 'Computer Science'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@college.edu',
          password: 'password123',
          role: 'club_head',
          studentId: 'STU002',
          year: '3rd Year',
          major: 'Photography'
        },
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@college.edu',
          password: 'password123',
          role: 'student',
          studentId: 'STU003',
          year: '2nd Year',
          major: 'Music Theory'
        },
        {
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@college.edu',
          password: 'password123',
          role: 'student',
          studentId: 'STU004',
          year: '1st Year',
          major: 'Engineering'
        },
        {
          firstName: 'Carol',
          lastName: 'Davis',
          email: 'carol@college.edu',
          password: 'password123',
          role: 'club_head',
          studentId: 'STU005',
          year: '4th Year',
          major: 'Literature'
        },
        {
          firstName: 'David',
          lastName: 'Brown',
          email: 'david@college.edu',
          password: 'password123',
          role: 'student',
          studentId: 'STU006',
          year: '3rd Year',
          major: 'Mathematics'
        },
        {
          firstName: 'Emma',
          lastName: 'Garcia',
          email: 'emma@college.edu',
          password: 'password123',
          role: 'student',
          studentId: 'STU007',
          year: '2nd Year',
          major: 'Business'
        }
      ];

      // Create and save users
      const savedUsers = [];
      for (const userData of users) {
        const user = new User(userData);
        await user.save();
        savedUsers.push(user);
        console.log(`👤 Created user: ${user.firstName} ${user.lastName} (${user.role})`);
      }

      const [adminUser, johnUser, janeUser, aliceUser, bobUser, carolUser, davidUser, emmaUser] = savedUsers;
      
      // Create comprehensive sample clubs with detailed information
      const clubs = [
        {
          name: 'Programming Club',
          description: 'Learn programming languages, work on projects, and participate in coding competitions. Open to all skill levels from beginners to advanced programmers.',
          category: { _id: 'cat1', name: 'Technology', color: '#2196F3', icon: '💻' },
          creator: johnUser._id,
          admins: [johnUser._id],
          contactEmail: 'programming@college.edu',
          meetingSchedule: 'Every Tuesday 6:00 PM - Room CS101',
          requirements: 'Basic interest in programming. Laptop recommended.',
          tags: ['programming', 'coding', 'technology', 'software', 'development'],
          maxMembers: 50,
          allowJoining: true,
          requireApproval: false
        },
        {
          name: 'Photography Club',
          description: 'Capture beautiful moments, learn photography techniques, and showcase your work. We organize photo walks and exhibitions.',
          category: { _id: 'cat2', name: 'Arts', color: '#FF9800', icon: '📸' },
          creator: janeUser._id,
          admins: [janeUser._id, carolUser._id],
          contactEmail: 'photo@college.edu',
          meetingSchedule: 'Every Friday 4:00 PM - Art Building',
          requirements: 'Camera (phone camera acceptable for beginners)',
          tags: ['photography', 'art', 'creative', 'visual'],
          maxMembers: 30,
          allowJoining: true,
          requireApproval: true
        },
        {
          name: 'Music Club',
          description: 'Make music together, learn instruments, and perform in concerts. We welcome all musical styles and skill levels.',
          category: { _id: 'cat2', name: 'Arts', color: '#FF9800', icon: '🎵' },
          creator: aliceUser._id,
          admins: [aliceUser._id],
          contactEmail: 'music@college.edu',
          meetingSchedule: 'Every Wednesday 7:00 PM - Music Hall',
          requirements: 'Any musical instrument or vocal interest',
          tags: ['music', 'instruments', 'singing', 'performance'],
          maxMembers: 40,
          allowJoining: true,
          requireApproval: true
        },
        {
          name: 'Debate Club',
          description: 'Sharpen your argumentation skills, participate in tournaments, and discuss current events and philosophical topics.',
          category: { _id: 'cat4', name: 'Academic', color: '#9C27B0', icon: '🎤' },
          creator: carolUser._id,
          admins: [carolUser._id],
          contactEmail: 'debate@college.edu',
          meetingSchedule: 'Every Monday 5:00 PM - Library Conference Room',
          requirements: 'Interest in public speaking and critical thinking',
          tags: ['debate', 'public speaking', 'argumentation', 'academic'],
          maxMembers: 25,
          allowJoining: true,
          requireApproval: false
        },
        {
          name: 'Robotics Club',
          description: 'Build robots, participate in competitions, and explore the intersection of hardware and software engineering.',
          category: { _id: 'cat1', name: 'Technology', color: '#2196F3', icon: '🤖' },
          creator: bobUser._id,
          admins: [bobUser._id, johnUser._id],
          contactEmail: 'robotics@college.edu',
          meetingSchedule: 'Every Thursday 6:30 PM - Engineering Lab',
          requirements: 'Basic programming or electronics knowledge preferred',
          tags: ['robotics', 'engineering', 'technology', 'competition'],
          maxMembers: 20,
          allowJoining: true,
          requireApproval: true
        },
        {
          name: 'Drama Club',
          description: 'Perform in plays, develop acting skills, and explore theatrical arts. We produce two shows per semester.',
          category: { _id: 'cat2', name: 'Arts', color: '#FF9800', icon: '🎭' },
          creator: emmaUser._id,
          admins: [emmaUser._id],
          contactEmail: 'drama@college.edu',
          meetingSchedule: 'Every Monday & Thursday 7:00 PM - Theater',
          requirements: 'Enthusiasm for acting and theater',
          tags: ['drama', 'theater', 'acting', 'performance', 'arts'],
          maxMembers: 35,
          allowJoining: true,
          requireApproval: false
        },
        {
          name: 'Environmental Club',
          description: 'Promote sustainability, organize campus cleanup events, and raise awareness about environmental issues.',
          category: { _id: 'cat5', name: 'Service', color: '#4CAF50', icon: '�' },
          creator: davidUser._id,
          admins: [davidUser._id],
          contactEmail: 'environment@college.edu',
          meetingSchedule: 'Every Saturday 10:00 AM - Student Center',
          requirements: 'Passion for environmental conservation',
          tags: ['environment', 'sustainability', 'conservation', 'service'],
          maxMembers: 60,
          allowJoining: true,
          requireApproval: false
        }
      ];

      // Create and save clubs
      const savedClubs = [];
      for (const clubData of clubs) {
        const club = new Club(clubData);
        await club.save();
        savedClubs.push(club);
        console.log(`🏛️ Created club: ${club.name} (${club.category.name})`);
      }

      const [programmingClub, photoClub, musicClub, debateClub, roboticsClub, dramaClub, environmentalClub] = savedClubs;
      
      // Create comprehensive club memberships
      const memberships = [
        // Programming Club members
        { clubId: programmingClub._id, userId: johnUser._id },
        { clubId: programmingClub._id, userId: bobUser._id },
        { clubId: programmingClub._id, userId: davidUser._id },
        { clubId: programmingClub._id, userId: aliceUser._id },
        
        // Photography Club members  
        { clubId: photoClub._id, userId: janeUser._id },
        { clubId: photoClub._id, userId: carolUser._id },
        { clubId: photoClub._id, userId: emmaUser._id },
        
        // Music Club members
        { clubId: musicClub._id, userId: aliceUser._id },
        { clubId: musicClub._id, userId: emmaUser._id },
        { clubId: musicClub._id, userId: janeUser._id },
        
        // Debate Club members
        { clubId: debateClub._id, userId: carolUser._id },
        { clubId: debateClub._id, userId: davidUser._id },
        { clubId: debateClub._id, userId: johnUser._id },
        
        // Robotics Club members
        { clubId: roboticsClub._id, userId: bobUser._id },
        { clubId: roboticsClub._id, userId: johnUser._id },
        { clubId: roboticsClub._id, userId: davidUser._id },
        
        // Drama Club members
        { clubId: dramaClub._id, userId: emmaUser._id },
        { clubId: dramaClub._id, userId: carolUser._id },
        
        // Environmental Club members
        { clubId: environmentalClub._id, userId: davidUser._id },
        { clubId: environmentalClub._id, userId: aliceUser._id },
        { clubId: environmentalClub._id, userId: bobUser._id }
      ];
      
      await ClubMember.insertMany(memberships);
      console.log(`👥 Created ${memberships.length} club memberships`);
      
      // Create diverse membership requests with different statuses
      const membershipRequests = [
        {
          clubId: photoClub._id,
          userId: bobUser._id,
          requestMessage: 'I am passionate about photography and would love to join the club to improve my skills and learn from experienced photographers.',
          status: 'pending'
        },
        {
          clubId: musicClub._id,
          userId: davidUser._id,
          requestMessage: 'I play guitar and piano, and would like to collaborate with other musicians in the club.',
          status: 'pending'
        },
        {
          clubId: roboticsClub._id,
          userId: aliceUser._id,
          requestMessage: 'I have experience with Arduino and would like to work on robotics projects.',
          status: 'pending'
        },
        {
          clubId: programmingClub._id,
          userId: emmaUser._id,
          requestMessage: 'I am learning Python and JavaScript and would like to join programming competitions.',
          status: 'approved',
          adminResponse: 'Welcome to the Programming Club! We meet every Tuesday.',
          respondedBy: johnUser._id,
          respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          clubId: dramaClub._id,
          userId: bobUser._id,
          requestMessage: 'I have some acting experience from high school and would like to audition for plays.',
          status: 'rejected',
          adminResponse: 'Thank you for your interest. Unfortunately, we are full for this semester, but please apply again next semester.',
          respondedBy: emmaUser._id,
          respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          clubId: environmentalClub._id,
          userId: janeUser._id,
          requestMessage: 'I am very concerned about climate change and want to contribute to campus sustainability efforts.',
          status: 'pending'
        }
      ];
      
      for (const requestData of membershipRequests) {
        const request = new MembershipRequest(requestData);
        await request.save();
        console.log(`📝 Created membership request: ${savedUsers.find(u => u._id.equals(request.userId)).firstName} → ${savedClubs.find(c => c._id.equals(request.clubId)).name} (${request.status})`);
      }
      
      // Update club member counts
      for (const club of savedClubs) {
        const memberCount = await ClubMember.countDocuments({ clubId: club._id });
        club.memberCount = memberCount;
        await club.save();
        console.log(`📊 Updated ${club.name} member count: ${memberCount}`);
      }
      
      console.log('✅ Comprehensive sample data initialized successfully!');
      console.log('📋 Summary:');
      console.log(`   👤 Users: ${savedUsers.length}`);
      console.log(`   🏛️ Clubs: ${savedClubs.length}`);
      console.log(`   👥 Memberships: ${memberships.length}`);
      console.log(`   📝 Membership Requests: ${membershipRequests.length}`);
    } else {
      console.log('📊 Database already contains data, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

// Store for active tokens (in production, use Redis or JWT)
const activeTokens = new Map();

// Simple authentication middleware for demo tokens
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }
  
  const user = activeTokens.get(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.'
    });
  }
  
  req.user = user;
  next();
};

// Role-based authorization
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('🔐 REGISTER ROUTE HIT');
    const { firstName, lastName, email, password, role } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || 'student'
    });
    
    await newUser.save();
    
    const token = 'demo-token-' + Date.now();
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role
    };
    
    activeTokens.set(token, userResponse);
    
    console.log('✅ Registration successful for:', userResponse.email);
    
    res.status(201).json({
      success: true,
      token: token,
      user: userResponse,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 LOGIN ROUTE HIT');
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user in database
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Use bcrypt to compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const token = 'demo-token-' + Date.now();
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };
    
    activeTokens.set(token, userResponse);
    
    console.log('✅ Login successful for:', userResponse.email);
    
    res.json({
      success: true,
      token: token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  const user = activeTokens.get(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  res.json({
    success: true,
    user: user
  });
});

// Profile update route
app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, studentId, year, major } = req.body;
    
    // Find and update user in database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (studentId) user.studentId = studentId;
    if (year) user.year = year;
    if (major) user.major = major;
    
    await user.save();
    
    // Update the token store with new user data
    const token = req.headers.authorization.split(' ')[1];
    const updatedUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      year: user.year,
      major: user.major
    };
    activeTokens.set(token, updatedUser);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
});

// Password change route
app.put('/api/auth/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Find user in database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
});

// Helper function to get user from token
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  return activeTokens.get(token);
};

// Clubs routes
app.get('/api/clubs', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Build query
    let query = {};
    if (category && category !== 'all') {
      query['category._id'] = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const clubs = await Club.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    // Add member count and club head info for each club
    const clubsWithDetails = await Promise.all(clubs.map(async (club) => {
      const memberCount = await ClubMember.countDocuments({ clubId: club._id });
      let clubHead = null;
      
      if (club.admins && club.admins.length > 0) {
        const headUser = await User.findById(club.admins[0]);
        if (headUser) {
          clubHead = {
            _id: headUser._id,
            firstName: headUser.firstName,
            lastName: headUser.lastName,
            email: headUser.email
          };
        }
      }
      
      return {
        ...club.toObject(),
        memberCount,
        clubHead
      };
    }));
    
    const totalClubs = await Club.countDocuments(query);
    const totalPages = Math.ceil(totalClubs / limitNum);
    
    res.json({
      success: true,
      data: clubsWithDetails,
      pagination: {
        currentPage: pageNum,
        pages: totalPages,
        totalItems: totalClubs,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clubs'
    });
  }
});

// Get club details
app.get('/api/clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }
    
    // Get members
    const members = await ClubMember.find({ clubId: id })
      .populate('userId', 'firstName lastName email role')
      .sort({ joinedAt: -1 });
    
    const memberDetails = members.map(member => ({
      _id: member.userId._id,
      firstName: member.userId.firstName,
      lastName: member.userId.lastName,
      email: member.userId.email,
      role: member.userId.role,
      joinedAt: member.joinedAt
    }));
    
    // Get club head
    let clubHead = null;
    if (club.admins && club.admins.length > 0) {
      const headUser = await User.findById(club.admins[0]);
      if (headUser) {
        clubHead = {
          _id: headUser._id,
          firstName: headUser.firstName,
          lastName: headUser.lastName,
          email: headUser.email
        };
      }
    }
    
    // Get announcements (mock for now)
    const announcements = [];
    
    // Get events (mock for now)
    const upcomingEvents = [];
    
    const clubData = {
      ...club.toObject(),
      memberCount: memberDetails.length,
      members: memberDetails,
      clubHead,
      announcements,
      upcomingEvents
    };
    
    res.json({
      success: true,
      data: clubData
    });
  } catch (error) {
    console.error('❌ Error fetching club details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch club details'
    });
  }
});

// Create club
app.post('/api/clubs', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get category details from the categories data
    const categories = [
      { _id: "cat1", name: "Technology", color: "#2196F3", icon: "💻" },
      { _id: "cat2", name: "Arts", color: "#FF9800", icon: "🎨" },
      { _id: "cat3", name: "Games", color: "#795548", icon: "♟️" },
      { _id: "cat4", name: "Academic", color: "#9C27B0", icon: "📚" },
      { _id: "cat5", name: "Service", color: "#4CAF50", icon: "🌱" }
    ];
    
    const selectedCategory = categories.find(cat => cat._id === req.body.category);
    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }
    
    // Extract category from req.body and replace with full category object
    const { category, ...bodyWithoutCategory } = req.body;
    const clubData = {
      ...bodyWithoutCategory,
      category: selectedCategory,
      creator: user._id,
      admins: [user._id]
    };
    
    const newClub = new Club(clubData);
    
    await newClub.save();
    
    // Add creator as member
    const membership = new ClubMember({
      clubId: newClub._id,
      userId: user._id
    });
    await membership.save();
    
    console.log('🏗️ Club created:', newClub.name, 'by', user.email);
    
    res.status(201).json({
      success: true,
      data: newClub,
      message: 'Club created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating club:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create club'
    });
  }
});

// Get user's clubs
app.get('/api/clubs/user/my-clubs', requireAuth, async (req, res) => {
  try {
    // Get user's club memberships
    const memberships = await ClubMember.find({ userId: req.user._id })
      .populate('clubId')
      .sort({ joinedAt: -1 });
    
    const clubsWithDetails = await Promise.all(memberships.map(async (membership) => {
      const club = membership.clubId;
      if (!club) return null;
      
      // Get member count
      const memberCount = await ClubMember.countDocuments({ clubId: club._id });
      
      // Check if user is admin
      const isAdmin = club.admins && club.admins.some(adminId => adminId.equals(req.user._id));
      
      return {
        ...club.toObject(),
        memberCount,
        joinedAt: membership.joinedAt,
        isAdmin,
        // Include admin IDs for frontend logic
        admins: club.admins || []
      };
    }));
    
    // Filter out null entries
    const validClubs = clubsWithDetails.filter(club => club !== null);
    
    res.json({
      success: true,
      data: validClubs
    });
  } catch (error) {
    console.error('❌ Error fetching user clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your clubs'
    });
  }
});

// Get user's events (placeholder for now)
app.get('/api/events/user/my-events', requireAuth, async (req, res) => {
  try {
    // This is a placeholder - you can implement actual events later
    res.json({
      success: true,
      data: [] // Empty array for now
    });
  } catch (error) {
    console.error('❌ Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your events'
    });
  }
});

// Join club
app.post('/api/clubs/:clubId/join', async (req, res) => {
  try {
    const { clubId } = req.params;
    const { message } = req.body;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if already a member
    const existingMembership = await ClubMember.findOne({
      clubId: clubId,
      userId: user._id
    });
    
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club'
      });
    }
    
    // Check for pending request
    const existingRequest = await MembershipRequest.findOne({
      clubId: clubId,
      userId: user._id,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending membership request for this club'
      });
    }
    
    // Get club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }
    
    if (!club.allowJoining) {
      return res.status(403).json({
        success: false,
        message: 'This club is not currently accepting new members'
      });
    }
    
    if (club.requireApproval) {
      // Create membership request
      const membershipRequest = new MembershipRequest({
        clubId: clubId,
        userId: user._id,
        message: message || ''
      });
      
      await membershipRequest.save();
      
      console.log(`📝 Membership request created: ${user.firstName} ${user.lastName} -> ${club.name}`);
      
      res.json({
        success: true,
        message: 'Membership request submitted successfully. Please wait for approval.',
        requiresApproval: true,
        requestId: membershipRequest._id
      });
    } else {
      // Direct joining
      const membership = new ClubMember({
        clubId: clubId,
        userId: user._id
      });
      
      await membership.save();
      
      console.log(`✅ User ${user.firstName} ${user.lastName} joined ${club.name} directly`);
      
      res.json({
        success: true,
        message: 'Successfully joined club',
        requiresApproval: false
      });
    }
  } catch (error) {
    console.error('❌ Error joining club:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join club'
    });
  }
});

// Get membership requests for a club
app.get('/api/clubs/:clubId/membership-requests', async (req, res) => {
  try {
    const { clubId } = req.params;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check permission
    let hasPermission = false;
    if (user.role === 'super_admin') {
      hasPermission = true;
    } else {
      const club = await Club.findById(clubId);
      if (club && club.admins && club.admins.some(adminId => adminId.toString() === user._id.toString())) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only club admins can view membership requests.'
      });
    }
    
    // Get pending requests
    const requests = await MembershipRequest.find({
      clubId: clubId,
      status: 'pending'
    }).populate('userId', 'firstName lastName email role').sort({ requestedAt: -1 });
    
    const requestsData = requests.map(req => {
      // Skip if userId is null (orphaned request)
      if (!req.userId) {
        console.warn(`⚠️ Skipping orphaned membership request ${req._id} - userId is null`);
        return null;
      }
      
      return {
        _id: req._id,
        clubId: req.clubId,
        userId: req.userId._id,
        user: {
          _id: req.userId._id,
          firstName: req.userId.firstName,
          lastName: req.userId.lastName,
          email: req.userId.email,
          role: req.userId.role
        },
        message: req.message,
        status: req.status,
        requestedAt: req.requestedAt
      };
    }).filter(req => req !== null); // Filter out null values from orphaned requests
    
    console.log(`📋 Found ${requestsData.length} pending membership requests for club ${clubId}`);
    
    res.json({
      success: true,
      data: requestsData
    });
  } catch (error) {
    console.error('❌ Error fetching membership requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership requests'
    });
  }
});

// Accept membership request
app.put('/api/clubs/:clubId/membership-requests/:requestId/accept', async (req, res) => {
  try {
    const { clubId, requestId } = req.params;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check permission
    let hasPermission = false;
    if (user.role === 'super_admin') {
      hasPermission = true;
    } else {
      const club = await Club.findById(clubId);
      if (club && club.admins && club.admins.some(adminId => adminId.toString() === user._id.toString())) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only club admins can accept membership requests.'
      });
    }
    
    // Find request
    const request = await MembershipRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Membership request not found or already processed'
      });
    }
    
    // Add user to club
    const membership = new ClubMember({
      clubId: clubId,
      userId: request.userId
    });
    await membership.save();
    
    // Update request status
    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = user._id;
    await request.save();
    
    console.log(`✅ Accepted membership request: ${requestId} for club ${clubId}`);
    
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
  } catch (error) {
    console.error('❌ Error accepting membership request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept membership request'
    });
  }
});

// Reject membership request
app.put('/api/clubs/:clubId/membership-requests/:requestId/reject', async (req, res) => {
  try {
    const { clubId, requestId } = req.params;
    const { reason } = req.body;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check permission
    let hasPermission = false;
    if (user.role === 'super_admin') {
      hasPermission = true;
    } else {
      const club = await Club.findById(clubId);
      if (club && club.admins && club.admins.some(adminId => adminId.toString() === user._id.toString())) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only club admins can reject membership requests.'
      });
    }
    
    // Find request
    const request = await MembershipRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Membership request not found or already processed'
      });
    }
    
    // Update request status
    request.status = 'rejected';
    request.rejectedAt = new Date();
    request.rejectedBy = user._id;
    request.rejectionReason = reason || '';
    await request.save();
    
    console.log(`❌ Rejected membership request: ${requestId} for club ${clubId}`);
    
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
  } catch (error) {
    console.error('❌ Error rejecting membership request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject membership request'
    });
  }
});

// Get membership status
app.get('/api/clubs/:clubId/membership-status', async (req, res) => {
  try {
    const { clubId } = req.params;
    const user = getUserFromToken(req);
    
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
    
    // Check membership
    const membership = await ClubMember.findOne({
      clubId: clubId,
      userId: user._id
    });
    
    if (membership) {
      status.isMember = true;
      status.canApply = false;
    }
    
    // Check requests
    const latestRequest = await MembershipRequest.findOne({
      clubId: clubId,
      userId: user._id
    }).sort({ requestedAt: -1 });
    
    if (latestRequest) {
      status.lastRequestId = latestRequest._id;
      status.lastRequestStatus = latestRequest.status;
      
      if (latestRequest.status === 'pending') {
        status.hasPendingRequest = true;
        status.canApply = false;
      } else if (latestRequest.status === 'rejected') {
        status.wasRejected = true;
        status.canApply = true;
      } else if (latestRequest.status === 'approved') {
        status.isMember = true;
        status.canApply = false;
      }
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Error fetching membership status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership status'
    });
  }
});

// Get club members
app.get('/api/clubs/:clubId/members', async (req, res) => {
  try {
    const { clubId } = req.params;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const members = await ClubMember.find({ clubId: clubId })
      .populate('userId', 'firstName lastName email role')
      .sort({ joinedAt: -1 });
    
    const memberDetails = members.map(member => ({
      _id: member.userId._id,
      firstName: member.userId.firstName,
      lastName: member.userId.lastName,
      email: member.userId.email,
      role: member.userId.role,
      joinedAt: member.joinedAt
    }));
    
    console.log(`👥 Found ${memberDetails.length} members for club ${clubId}`);
    
    res.json({
      success: true,
      data: memberDetails
    });
  } catch (error) {
    console.error('❌ Error fetching club members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch club members'
    });
  }
});

// Categories route
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

// Dashboard stats
app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const totalClubs = await Club.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalMembers = await ClubMember.countDocuments();
    
    const stats = {
      totalClubs,
      totalEvents: 0, // Mock for now
      totalMembers: totalUsers,
      upcomingEvents: 0 // Mock for now
    };
    
    if (user.role === 'super_admin') {
      stats.adminClubs = totalClubs;
      stats.activeUsers = totalUsers;
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// Admin routes - require super_admin role
app.get('/api/admin/dashboard', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    console.log('🔥 Admin dashboard route hit!');
    
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClubHeads = await User.countDocuments({ role: 'club_head' });
    
    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Recent clubs (last 30 days)
    const recentClubs = await Club.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      totalUsers,
      totalClubs,
      totalEvents,
      totalStudents,
      totalClubHeads,
      recentUsers,
      recentClubs
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard stats'
    });
  }
});

app.get('/api/admin/users', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

app.get('/api/admin/clubs', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const clubs = await Club.find({})
      .populate('creator', 'firstName lastName email')
      .populate('admins', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // For each club, find the member count from ClubMember collection
    const clubsWithMemberCount = await Promise.all(clubs.map(async (club) => {
      const memberCount = await ClubMember.countDocuments({ clubId: club._id, isActive: true });
      const clubObj = club.toObject();
      clubObj.memberCount = memberCount;
      
      // Determine club head - could be creator or first admin
      clubObj.clubHead = clubObj.creator;
      if (clubObj.admins && clubObj.admins.length > 0) {
        clubObj.clubHead = clubObj.admins[0];
      }
      
      return clubObj;
    }));

    res.json({
      success: true,
      data: clubsWithMemberCount
    });
  } catch (error) {
    console.error('Get admin clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clubs'
    });
  }
});

app.get('/api/admin/clubs/no-head', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    // Find clubs that have no admins and creator is not active or doesn't have club_head role
    const clubs = await Club.find({})
      .populate('creator', 'firstName lastName email role')
      .populate('admins', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    const clubsWithoutHead = [];
    
    for (const club of clubs) {
      // Check if club has no admins or if creator/admins are not club_heads
      const hasActiveClubHead = club.admins.some(admin => admin.role === 'club_head') || 
                               (club.creator && club.creator.role === 'club_head');
      
      if (!hasActiveClubHead) {
        const memberCount = await ClubMember.countDocuments({ clubId: club._id, isActive: true });
        const clubObj = club.toObject();
        clubObj.memberCount = memberCount;
        clubsWithoutHead.push(clubObj);
      }
    }

    res.json({
      success: true,
      data: clubsWithoutHead
    });
  } catch (error) {
    console.error('Get clubs without head error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clubs without heads'
    });
  }
});

app.put('/api/admin/users/:id/role', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const { role, assignedClub } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    // If assigning as club head, update the club
    if (role === 'club_head' && assignedClub) {
      const club = await Club.findById(assignedClub);
      if (club && !club.admins.includes(userId)) {
        club.admins.push(userId);
        await club.save();
      }
      
      // Make sure the user is also a member of the club
      await ClubMember.findOneAndUpdate(
        { clubId: assignedClub, userId: userId },
        { clubId: assignedClub, userId: userId, isActive: true },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

app.delete('/api/admin/users/:id', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove user from all clubs
    await Club.updateMany(
      { $or: [{ admins: userId }, { creator: userId }] },
      { $pull: { admins: userId } }
    );

    // Remove user from club memberships
    await ClubMember.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

app.put('/api/admin/clubs/:id/assign-head', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const { clubHeadId } = req.body;
    const clubId = req.params.id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const user = await User.findById(clubHeadId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to club admins if not already present
    if (!club.admins.includes(clubHeadId)) {
      club.admins.push(clubHeadId);
      await club.save();
    }

    // Update user role to club_head
    user.role = 'club_head';
    await user.save();

    // Make sure the user is also a member of the club
    await ClubMember.findOneAndUpdate(
      { clubId, userId: clubHeadId },
      { clubId, userId: clubHeadId, isActive: true },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Club head assigned successfully'
    });
  } catch (error) {
    console.error('Assign club head error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign club head'
    });
  }
});

app.delete('/api/admin/clubs/:id', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const clubId = req.params.id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    await Club.findByIdAndDelete(clubId);

    res.json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete club'
    });
  }
});

// Remove member from club
app.delete('/api/clubs/:clubId/members/:memberId', requireAuth, async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    
    // Find the club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }
    
    // Check if user has permission (club admin or super admin)
    const clubAdmins = club.admins || [];
    const userId = req.user._id?.toString() || req.user._id;
    const isClubAdmin = clubAdmins.some(adminId => adminId.toString() === userId);
    const isSuperAdmin = req.user.role === 'super_admin';
    
    if (!isClubAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this club'
      });
    }
    
    // Check if target user is a member
    const existingMembership = await ClubMember.findOne({
      clubId: clubId,
      userId: memberId
    });
    if (!existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this club'
      });
    }
    
    // Cannot remove club admins unless super admin is doing it
    const isTargetAdmin = clubAdmins.some(adminId => adminId.toString() === memberId.toString());
    if (isTargetAdmin && !isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove club admins. Remove admin privileges first.'
      });
    }
    
    // Super admins can remove admins but warn them
    if (isTargetAdmin && isSuperAdmin) {
      console.log('⚠️  Super admin removing club admin:', memberId, 'from club:', club.name);
      
      // Remove from admins array if super admin is removing an admin
      club.admins = club.admins.filter(adminId => adminId.toString() !== memberId.toString());
      await club.save();
    }
    
    // Remove member from club
    await ClubMember.findOneAndDelete({
      clubId: clubId,
      userId: memberId
    });
    
    // Update club member count
    const memberCount = await ClubMember.countDocuments({ clubId });
    await Club.findByIdAndUpdate(clubId, { memberCount });
    
    const removedUser = await User.findById(memberId).select('firstName lastName email');
    console.log(`👤 Member ${removedUser?.email} removed from club ${club.name} by ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('❌ Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
});

// Create event
app.post('/api/events', requireAuth, async (req, res) => {
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
    
    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }
    
    // Check if user can create events for this club (club admin or super admin)
    const canCreateEvent = req.user.role === 'super_admin' || club.admins.includes(req.user._id);
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
    
    // Create the event
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
      isPublic: isPublic !== false,
      status: 'upcoming'
    });
    
    // Populate the event with club and organizer details
    const populatedEvent = await Event.findById(event._id)
      .populate('clubId', 'name logo category')
      .populate('organizer', 'firstName lastName email');
    
    console.log(`🎉 Event created: ${event.title} by ${req.user.email} for club ${club.name}`);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: message[0] || 'Validation error'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      clubId, 
      status = 'upcoming',
      search
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
    
    const events = await Event.find(query)
      .populate('clubId', 'name logo category')
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Event.countDocuments(query);
    
    console.log(`📅 Fetched ${events.length} events - Page ${page}`);
    
    res.json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name logo category description')
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email');
    
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
    
    console.log(`📅 Event ${event.title} viewed by user ${req.user?.email || 'anonymous'}`);
    
    res.json({
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
    console.error('❌ Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

// Join event
app.post('/api/events/:id/join', requireAuth, async (req, res) => {
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
    
    console.log(`🎉 User ${req.user.email} joined event ${event.title}`);
    
    res.json({
      success: true,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error('❌ Error joining event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join event'
    });
  }
});

// Leave event
app.post('/api/events/:id/leave', requireAuth, async (req, res) => {
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
    
    console.log(`👋 User ${req.user.email} left event ${event.title}`);
    
    res.json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('❌ Error leaving event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave event'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MongoDB Backend Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎯 Events API: http://localhost:${PORT}/api/events`);
    console.log(`🏠 Clubs API: http://localhost:${PORT}/api/clubs`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🌐 MongoDB UI: http://localhost:8081`);
  });
});

module.exports = app;
