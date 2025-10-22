const User = require('../models/User');
const Club = require('../models/Club');
const Category = require('../models/Category');
const Event = require('../models/Event');
const logger = require('./logger');

const seedSampleData = async () => {
  try {
    // Check if sample data already exists
    const existingUsers = await User.countDocuments({ role: 'student' });
    if (existingUsers > 5) {
      logger.info('Sample data already exists');
      return;
    }

    // Sample students (passwords will be hashed by pre-save hook)
    const sampleStudents = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@college.edu',
        password: 'password123', // Will be hashed automatically
        studentId: 'STU001',
        role: 'student',
        year: 'Sophomore',
        major: 'Computer Science',
        bio: 'Passionate about technology and coding.'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@college.edu',
        password: 'password123', // Will be hashed automatically
        studentId: 'STU002',
        role: 'student',
        year: 'Junior',
        major: 'Business Administration',
        bio: 'Future entrepreneur with a love for innovation.'
      },
      {
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@college.edu',
        password: 'password123', // Will be hashed automatically
        studentId: 'STU003',
        role: 'club_head',
        year: 'Senior',
        major: 'Engineering',
        bio: 'Club head and engineering enthusiast.'
      },
      {
        firstName: 'Emily',
        lastName: 'Wilson',
        email: 'emily.wilson@college.edu',
        password: 'password123', // Will be hashed automatically
        studentId: 'STU004',
        role: 'student',
        year: 'Freshman',
        major: 'Art',
        bio: 'Creative artist and design lover.'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@college.edu',
        password: 'password123', // Will be hashed automatically
        studentId: 'STU005',
        role: 'club_head',
        year: 'Senior',
        major: 'Sports Management',
        bio: 'Sports enthusiast and team leader.'
      }
    ];

    // Create sample students (each will be saved individually to trigger pre-save hooks)
    const createdStudents = [];
    for (const studentData of sampleStudents) {
      const student = await User.create(studentData);
      createdStudents.push(student);
    }
    
    logger.info(`Created ${createdStudents.length} sample students`);

    // Get categories for clubs
    const categories = await Category.find({});
    if (categories.length === 0) {
      logger.warn('No categories found, skipping club creation');
      return;
    }

    // Find club heads
    const clubHeads = createdStudents.filter(user => user.role === 'club_head');

    // Sample clubs
    const sampleClubs = [
      {
        name: 'Programming Club',
        description: 'A community of coding enthusiasts sharing knowledge and building amazing projects together.',
        category: categories.find(c => c.name === 'Technology')._id,
        creator: clubHeads[0]._id,
        clubHead: clubHeads[0]._id,
        members: [clubHeads[0]._id, createdStudents[0]._id],
        contactEmail: 'programming@college.edu',
        meetingSchedule: 'Every Tuesday 7:00 PM',
        requirements: 'Basic programming knowledge helpful but not required',
        tags: ['programming', 'coding', 'software', 'development'],
        maxMembers: 50,
        allowJoining: true
      },
      {
        name: 'Basketball Club',
        description: 'Join us for weekly basketball games, tournaments, and skill development sessions.',
        category: categories.find(c => c.name === 'Sports & Recreation')._id,
        creator: clubHeads[1]._id,
        clubHead: clubHeads[1]._id,
        members: [clubHeads[1]._id, createdStudents[1]._id],
        contactEmail: 'basketball@college.edu',
        meetingSchedule: 'Mondays and Thursdays 6:00 PM',
        requirements: 'No experience required, all skill levels welcome',
        tags: ['basketball', 'sports', 'fitness', 'team'],
        maxMembers: 30,
        allowJoining: true
      },
      {
        name: 'Art Society',
        description: 'Express your creativity through various art forms including painting, sculpture, and digital art.',
        category: categories.find(c => c.name === 'Arts & Culture')._id,
        creator: clubHeads[0]._id,
        clubHead: clubHeads[0]._id,
        members: [clubHeads[0]._id, createdStudents[3]._id],
        contactEmail: 'art@college.edu',
        meetingSchedule: 'Wednesday 5:00 PM',
        requirements: 'Passion for art and creativity',
        tags: ['art', 'painting', 'creativity', 'culture'],
        maxMembers: 25,
        allowJoining: true
      }
    ];

    // Create sample clubs
    const createdClubs = await Club.insertMany(sampleClubs);
    logger.info(`Created ${createdClubs.length} sample clubs`);

    // Update users' joinedClubs
    for (let i = 0; i < createdClubs.length; i++) {
      const club = createdClubs[i];
      await User.updateMany(
        { _id: { $in: club.members } },
        { $addToSet: { joinedClubs: club._id } }
      );
    }

    // Create sample events
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const sampleEvents = [
      {
        title: 'JavaScript Workshop',
        description: 'Learn modern JavaScript concepts and best practices. Perfect for beginners and intermediate programmers.',
        clubId: createdClubs[0]._id, // Programming Club
        organizer: clubHeads[0]._id,
        dateTime: tomorrow,
        endDateTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
        location: 'Computer Lab A',
        maxAttendees: 30,
        status: 'upcoming'
      },
      {
        title: 'Annual Hackathon',
        description: '48-hour coding marathon with prizes and mentorship from industry experts.',
        clubId: createdClubs[0]._id, // Programming Club
        organizer: clubHeads[0]._id,
        dateTime: nextWeek,
        endDateTime: new Date(nextWeek.getTime() + 48 * 60 * 60 * 1000), // 48 hours later
        location: 'Main Auditorium',
        maxAttendees: 100,
        status: 'upcoming'
      },
      {
        title: 'Photography Walk',
        description: 'Explore campus beauty through your lens. Bring your camera or phone!',
        clubId: createdClubs[1]._id, // Photography Club
        organizer: clubHeads[1]._id,
        dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        location: 'Campus Gardens',
        maxAttendees: 20,
        status: 'upcoming'
      },
      {
        title: 'Open Mic Night',
        description: 'Share your musical talents with fellow students. All skill levels welcome!',
        clubId: createdClubs[2]._id, // Music Club
        organizer: clubHeads[0]._id, // Using clubHeads[0] since we only have 2 club heads
        dateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        location: 'Student Center Stage',
        maxAttendees: 50,
        status: 'upcoming'
      },
      {
        title: 'Debate Tournament',
        description: 'Inter-college debate competition on current affairs and social issues.',
        clubId: createdClubs[3]._id, // Debate Club
        organizer: clubHeads[1]._id, // Using clubHeads[1] since we only have 2 club heads
        dateTime: nextMonth,
        endDateTime: new Date(nextMonth.getTime() + 6 * 60 * 60 * 1000), // 6 hours later
        location: 'Main Hall',
        maxAttendees: 40,
        status: 'upcoming'
      }
    ];

    const createdEvents = await Event.insertMany(sampleEvents);
    logger.info(`Created ${createdEvents.length} sample events`);

    console.log('\n🎯 SAMPLE DATA CREATED:');
    console.log('👥 Sample Students:');
    sampleStudents.forEach(student => {
      console.log(`   📧 ${student.email} (Password: password123) - Role: ${student.role}`);
    });
    console.log('\n🏛️ Sample Clubs:');
    sampleClubs.forEach(club => {
      console.log(`   🎪 ${club.name}`);
    });
    console.log('\n📅 Sample Events:');
    sampleEvents.forEach(event => {
      console.log(`   🎉 ${event.title} - ${event.dateTime.toDateString()}`);
    });
    console.log('\n⚠️  All sample users have password: password123\n');

  } catch (error) {
    logger.error('Error creating sample data:', error);
    console.error('❌ Failed to create sample data:', error.message);
  }
};

module.exports = seedSampleData;
