const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Club = require('./models/Club');
const ClubMember = require('./models/ClubMember');
const MembershipRequest = require('./models/MembershipRequest');

// Database seeding script
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB for seeding');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Club.deleteMany({});
    await ClubMember.deleteMany({});
    await MembershipRequest.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed comprehensive sample data
    await seedUsers();
    await seedClubs();
    await seedMemberships();
    await seedMembershipRequests();
    await updateClubMemberCounts();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Seed users with comprehensive profiles
const seedUsers = async () => {
  console.log('👤 Seeding users...');
  
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
    },
    {
      firstName: 'Frank',
      lastName: 'Miller',
      email: 'frank@college.edu',
      password: 'password123',
      role: 'student',
      studentId: 'STU008',
      year: '1st Year',
      major: 'Physics'
    },
    {
      firstName: 'Grace',
      lastName: 'Lee',
      email: 'grace@college.edu',
      password: 'password123',
      role: 'student',
      studentId: 'STU009',
      year: '3rd Year',
      major: 'Art History'
    }
  ];

  const savedUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    savedUsers.push(user);
    console.log(`   ✓ Created: ${user.firstName} ${user.lastName} (${user.role})`);
  }

  global.users = savedUsers;
  return savedUsers;
};

// Seed clubs with detailed information
const seedClubs = async () => {
  console.log('🏛️ Seeding clubs...');
  
  const [adminUser, johnUser, janeUser, aliceUser, bobUser, carolUser, davidUser, emmaUser, frankUser, graceUser] = global.users;
  
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
      category: { _id: 'cat5', name: 'Service', color: '#4CAF50', icon: '🌱' },
      creator: davidUser._id,
      admins: [davidUser._id],
      contactEmail: 'environment@college.edu',
      meetingSchedule: 'Every Saturday 10:00 AM - Student Center',
      requirements: 'Passion for environmental conservation',
      tags: ['environment', 'sustainability', 'conservation', 'service'],
      maxMembers: 60,
      allowJoining: true,
      requireApproval: false
    },
    {
      name: 'Chess Club',
      description: 'Play chess games, learn strategies, and participate in tournaments. All skill levels welcome.',
      category: { _id: 'cat3', name: 'Games', color: '#795548', icon: '♟️' },
      creator: frankUser._id,
      admins: [frankUser._id],
      contactEmail: 'chess@college.edu',
      meetingSchedule: 'Every Sunday 2:00 PM - Student Lounge',
      requirements: 'Basic knowledge of chess rules',
      tags: ['chess', 'strategy', 'games', 'tournament'],
      maxMembers: 40,
      allowJoining: true,
      requireApproval: false
    },
    {
      name: 'Art History Society',
      description: 'Explore art movements, visit museums, and discuss masterpieces throughout history.',
      category: { _id: 'cat4', name: 'Academic', color: '#9C27B0', icon: '🎨' },
      creator: graceUser._id,
      admins: [graceUser._id],
      contactEmail: 'arthistory@college.edu',
      meetingSchedule: 'Every Wednesday 3:00 PM - Art Building',
      requirements: 'Interest in art and history',
      tags: ['art', 'history', 'culture', 'museums'],
      maxMembers: 25,
      allowJoining: true,
      requireApproval: true
    }
  ];

  const savedClubs = [];
  for (const clubData of clubs) {
    const club = new Club(clubData);
    await club.save();
    savedClubs.push(club);
    console.log(`   ✓ Created: ${club.name} (${club.category.name})`);
  }

  global.clubs = savedClubs;
  return savedClubs;
};

// Seed club memberships
const seedMemberships = async () => {
  console.log('👥 Seeding club memberships...');
  
  const users = global.users;
  const clubs = global.clubs;
  
  const memberships = [
    // Programming Club members (5 members)
    { clubId: clubs[0]._id, userId: users[1]._id }, // John (creator)
    { clubId: clubs[0]._id, userId: users[4]._id }, // Bob
    { clubId: clubs[0]._id, userId: users[6]._id }, // David
    { clubId: clubs[0]._id, userId: users[3]._id }, // Alice
    { clubId: clubs[0]._id, userId: users[8]._id }, // Frank
    
    // Photography Club members (4 members)
    { clubId: clubs[1]._id, userId: users[2]._id }, // Jane (creator)
    { clubId: clubs[1]._id, userId: users[5]._id }, // Carol (admin)
    { clubId: clubs[1]._id, userId: users[7]._id }, // Emma
    { clubId: clubs[1]._id, userId: users[9]._id }, // Grace
    
    // Music Club members (3 members)
    { clubId: clubs[2]._id, userId: users[3]._id }, // Alice (creator)
    { clubId: clubs[2]._id, userId: users[7]._id }, // Emma
    { clubId: clubs[2]._id, userId: users[2]._id }, // Jane
    
    // Debate Club members (4 members)
    { clubId: clubs[3]._id, userId: users[5]._id }, // Carol (creator)
    { clubId: clubs[3]._id, userId: users[6]._id }, // David
    { clubId: clubs[3]._id, userId: users[1]._id }, // John
    { clubId: clubs[3]._id, userId: users[9]._id }, // Grace
    
    // Robotics Club members (3 members)
    { clubId: clubs[4]._id, userId: users[4]._id }, // Bob (creator)
    { clubId: clubs[4]._id, userId: users[1]._id }, // John (admin)
    { clubId: clubs[4]._id, userId: users[6]._id }, // David
    
    // Drama Club members (2 members)
    { clubId: clubs[5]._id, userId: users[7]._id }, // Emma (creator)
    { clubId: clubs[5]._id, userId: users[5]._id }, // Carol
    
    // Environmental Club members (4 members)
    { clubId: clubs[6]._id, userId: users[6]._id }, // David (creator)
    { clubId: clubs[6]._id, userId: users[3]._id }, // Alice
    { clubId: clubs[6]._id, userId: users[4]._id }, // Bob
    { clubId: clubs[6]._id, userId: users[2]._id }, // Jane
    
    // Chess Club members (2 members)
    { clubId: clubs[7]._id, userId: users[8]._id }, // Frank (creator)
    { clubId: clubs[7]._id, userId: users[6]._id }, // David
    
    // Art History Society members (2 members)
    { clubId: clubs[8]._id, userId: users[9]._id }, // Grace (creator)
    { clubId: clubs[8]._id, userId: users[2]._id }  // Jane
  ];
  
  await ClubMember.insertMany(memberships);
  console.log(`   ✓ Created ${memberships.length} club memberships`);
  
  return memberships;
};

// Seed membership requests with various statuses
const seedMembershipRequests = async () => {
  console.log('📝 Seeding membership requests...');
  
  const users = global.users;
  const clubs = global.clubs;
  
  const membershipRequests = [
    // Pending requests
    {
      clubId: clubs[1]._id, // Photography Club
      userId: users[4]._id,  // Bob
      requestMessage: 'I am passionate about photography and would love to join the club to improve my skills and learn from experienced photographers.',
      status: 'pending'
    },
    {
      clubId: clubs[2]._id, // Music Club
      userId: users[6]._id,  // David
      requestMessage: 'I play guitar and piano, and would like to collaborate with other musicians in the club.',
      status: 'pending'
    },
    {
      clubId: clubs[4]._id, // Robotics Club
      userId: users[3]._id,  // Alice
      requestMessage: 'I have experience with Arduino and would like to work on robotics projects.',
      status: 'pending'
    },
    {
      clubId: clubs[8]._id, // Art History Society
      userId: users[7]._id,  // Emma
      requestMessage: 'I am studying art history and would like to join discussions about art movements.',
      status: 'pending'
    },
    {
      clubId: clubs[7]._id, // Chess Club
      userId: users[3]._id,  // Alice
      requestMessage: 'I have been playing chess since childhood and would love to join tournaments.',
      status: 'pending'
    },
    
    // Approved requests
    {
      clubId: clubs[0]._id, // Programming Club
      userId: users[7]._id,  // Emma
      requestMessage: 'I am learning Python and JavaScript and would like to join programming competitions.',
      status: 'approved',
      adminResponse: 'Welcome to the Programming Club! We meet every Tuesday at 6 PM.',
      respondedBy: users[1]._id, // John
      respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      clubId: clubs[6]._id, // Environmental Club
      userId: users[8]._id,  // Frank
      requestMessage: 'I am very concerned about climate change and want to contribute to campus sustainability efforts.',
      status: 'approved',
      adminResponse: 'Great to have you! Join us for the next cleanup event this Saturday.',
      respondedBy: users[6]._id, // David
      respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    
    // Rejected requests
    {
      clubId: clubs[5]._id, // Drama Club
      userId: users[4]._id,  // Bob
      requestMessage: 'I have some acting experience from high school and would like to audition for plays.',
      status: 'rejected',
      adminResponse: 'Thank you for your interest. Unfortunately, we are full for this semester, but please apply again next semester.',
      respondedBy: users[7]._id, // Emma
      respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      clubId: clubs[1]._id, // Photography Club
      userId: users[8]._id,  // Frank
      requestMessage: 'I want to learn photography for my travel blog.',
      status: 'rejected',
      adminResponse: 'We appreciate your interest, but we require some basic photography knowledge for new members.',
      respondedBy: users[2]._id, // Jane
      respondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ];
  
  for (const requestData of membershipRequests) {
    const request = new MembershipRequest(requestData);
    await request.save();
    const user = users.find(u => u._id.equals(request.userId));
    const club = clubs.find(c => c._id.equals(request.clubId));
    console.log(`   ✓ Created: ${user.firstName} → ${club.name} (${request.status})`);
  }
  
  return membershipRequests;
};

// Update club member counts
const updateClubMemberCounts = async () => {
  console.log('📊 Updating club member counts...');
  
  const clubs = global.clubs;
  
  for (const club of clubs) {
    const memberCount = await ClubMember.countDocuments({ clubId: club._id });
    club.memberCount = memberCount;
    await club.save();
    console.log(`   ✓ ${club.name}: ${memberCount} members`);
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
