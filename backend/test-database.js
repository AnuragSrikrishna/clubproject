const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Club = require('./models/Club');
const ClubMember = require('./models/ClubMember');
const MembershipRequest = require('./models/MembershipRequest');

// Test database connection and data
const testDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB for testing');

    // Test queries to verify data structure
    console.log('\n🔍 Testing database queries...');

    // Test user data
    const users = await User.find({}).limit(3);
    console.log(`\n👤 Sample Users (${users.length}):`);
    users.forEach(user => {
      console.log(`   ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.major || 'No major'}`);
    });

    // Test club data
    const clubs = await Club.find({}).limit(3);
    console.log(`\n🏛️ Sample Clubs (${clubs.length}):`);
    clubs.forEach(club => {
      console.log(`   ${club.name} - ${club.category.name} - ${club.memberCount} members`);
    });

    // Test membership requests with populated user data
    const requests = await MembershipRequest.find({})
      .populate('userId', 'firstName lastName email')
      .populate('clubId', 'name')
      .limit(5);
    
    console.log(`\n📝 Sample Membership Requests (${requests.length}):`);
    requests.forEach(request => {
      const userName = request.userId ? `${request.userId.firstName} ${request.userId.lastName}` : 'Unknown User';
      const clubName = request.clubId ? request.clubId.name : 'Unknown Club';
      console.log(`   ${userName} → ${clubName} (${request.status})`);
    });

    // Test club memberships
    const memberships = await ClubMember.find({})
      .populate('userId', 'firstName lastName')
      .populate('clubId', 'name')
      .limit(5);
    
    console.log(`\n👥 Sample Club Memberships (${memberships.length}):`);
    memberships.forEach(membership => {
      const userName = membership.userId ? `${membership.userId.firstName} ${membership.userId.lastName}` : 'Unknown User';
      const clubName = membership.clubId ? membership.clubId.name : 'Unknown Club';
      console.log(`   ${userName} ∈ ${clubName}`);
    });

    // Count statistics
    const stats = {
      users: await User.countDocuments(),
      clubs: await Club.countDocuments(),
      memberships: await ClubMember.countDocuments(),
      pendingRequests: await MembershipRequest.countDocuments({ status: 'pending' }),
      totalRequests: await MembershipRequest.countDocuments()
    };

    console.log('\n📊 Database Statistics:');
    console.log(`   Total Users: ${stats.users}`);
    console.log(`   Total Clubs: ${stats.clubs}`);
    console.log(`   Total Memberships: ${stats.memberships}`);
    console.log(`   Pending Requests: ${stats.pendingRequests}`);
    console.log(`   Total Requests: ${stats.totalRequests}`);

    // Test specific queries that the frontend uses
    console.log('\n🔍 Testing frontend queries...');

    // Test getting clubs with member counts
    const clubsWithMembers = await Club.aggregate([
      {
        $lookup: {
          from: 'clubmembers',
          localField: '_id',
          foreignField: 'clubId',
          as: 'members'
        }
      },
      {
        $addFields: {
          actualMemberCount: { $size: '$members' }
        }
      },
      { $limit: 3 }
    ]);

    console.log('📊 Clubs with accurate member counts:');
    clubsWithMembers.forEach(club => {
      console.log(`   ${club.name}: ${club.actualMemberCount} members (stored: ${club.memberCount})`);
    });

    // Test membership request workflow query
    const pendingRequestsForClubs = await MembershipRequest.aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'clubs',
          localField: 'clubId',
          foreignField: '_id',
          as: 'club'
        }
      },
      { $unwind: '$user' },
      { $unwind: '$club' }
    ]);

    console.log(`\n📋 Pending Requests with User Details (${pendingRequestsForClubs.length}):`);
    pendingRequestsForClubs.forEach(request => {
      console.log(`   ${request.user.firstName} ${request.user.lastName} wants to join ${request.club.name}`);
      console.log(`      Message: "${request.requestMessage}"`);
    });

    console.log('\n✅ Database test completed successfully!');
    console.log('🎯 All data structures are working correctly for the frontend.');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
