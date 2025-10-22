const mongoose = require('mongoose');

// Import models to ensure they're registered
require('./models/User');
require('./models/Club');
require('./models/ClubMember');
require('./models/MembershipRequest');
require('./models/Event');
require('./models/Announcement');
require('./models/Category');

/**
 * Database Migration Script
 * Handles schema updates and data transformations
 */
class DatabaseMigration {
  constructor() {
    this.mongoUri = 'mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin';
  }

  async connect() {
    try {
      await mongoose.connect(this.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('📊 Connected to MongoDB for migration');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }

  /**
   * Run all migrations
   */
  async runMigrations() {
    console.log('🔄 Starting database migrations...');
    
    try {
      await this.connect();
      
      // Run individual migrations
      await this.migration001_AddUserFields();
      await this.migration002_UpdateClubSchema();
      await this.migration003_FixMembershipRequests();
      await this.migration004_AddIndexes();
      await this.migration005_UpdateMemberCounts();
      
      console.log('✅ All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Migration 001: Add missing user fields
   */
  async migration001_AddUserFields() {
    console.log('🔄 Migration 001: Adding missing user fields...');
    
    const User = mongoose.model('User');
    
    // Add studentId, year, major to existing users without these fields
    const usersToUpdate = await User.find({
      $or: [
        { studentId: { $exists: false } },
        { year: { $exists: false } },
        { major: { $exists: false } }
      ]
    });

    for (let user of usersToUpdate) {
      if (!user.studentId) {
        user.studentId = `STU${String(Math.floor(Math.random() * 9000) + 1000)}`;
      }
      if (!user.year) {
        const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        user.year = years[Math.floor(Math.random() * years.length)];
      }
      if (!user.major) {
        const majors = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Mathematics', 'Literature', 'Physics'];
        user.major = majors[Math.floor(Math.random() * majors.length)];
      }
      await user.save();
      console.log(`   ✓ Updated user: ${user.firstName} ${user.lastName}`);
    }
    
    console.log(`✅ Migration 001 completed: Updated ${usersToUpdate.length} users`);
  }

  /**
   * Migration 002: Update club schema with new fields
   */
  async migration002_UpdateClubSchema() {
    console.log('🔄 Migration 002: Updating club schema...');
    
    const Club = mongoose.model('Club');
    
    // Add missing fields to existing clubs
    const clubsToUpdate = await Club.find({
      $or: [
        { meetingSchedule: { $exists: false } },
        { requirements: { $exists: false } },
        { tags: { $exists: false } },
        { maxMembers: { $exists: false } }
      ]
    });

    for (let club of clubsToUpdate) {
      if (!club.meetingSchedule) {
        club.meetingSchedule = 'Schedule TBD';
      }
      if (!club.requirements) {
        club.requirements = 'No specific requirements';
      }
      if (!club.tags || club.tags.length === 0) {
        club.tags = [club.name.toLowerCase().replace(' ', '-')];
      }
      if (!club.maxMembers) {
        club.maxMembers = 50; // Default max members
      }
      await club.save();
      console.log(`   ✓ Updated club: ${club.name}`);
    }
    
    console.log(`✅ Migration 002 completed: Updated ${clubsToUpdate.length} clubs`);
  }

  /**
   * Migration 003: Fix membership request field names
   */
  async migration003_FixMembershipRequests() {
    console.log('🔄 Migration 003: Fixing membership request schema...');
    
    const MembershipRequest = mongoose.model('MembershipRequest');
    
    // Fix field name from 'message' to 'requestMessage' if needed
    const requestsToUpdate = await MembershipRequest.find({
      message: { $exists: true },
      requestMessage: { $exists: false }
    });

    for (let request of requestsToUpdate) {
      if (request.message && !request.requestMessage) {
        request.requestMessage = request.message;
        request.message = undefined;
        await request.save();
        console.log(`   ✓ Updated membership request field`);
      }
    }
    
    console.log(`✅ Migration 003 completed: Updated ${requestsToUpdate.length} membership requests`);
  }

  /**
   * Migration 004: Add database indexes for performance
   */
  async migration004_AddIndexes() {
    console.log('🔄 Migration 004: Adding database indexes...');
    
    const User = mongoose.model('User');
    const Club = mongoose.model('Club');
    const ClubMember = mongoose.model('ClubMember');
    const MembershipRequest = mongoose.model('MembershipRequest');

    try {
      // User indexes
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ role: 1 });
      await User.collection.createIndex({ studentId: 1 });
      
      // Club indexes
      await Club.collection.createIndex({ name: 1 }, { unique: true });
      await Club.collection.createIndex({ 'category.name': 1 });
      await Club.collection.createIndex({ creator: 1 });
      await Club.collection.createIndex({ isActive: 1 });
      
      // ClubMember indexes
      await ClubMember.collection.createIndex({ clubId: 1, userId: 1 }, { unique: true });
      await ClubMember.collection.createIndex({ clubId: 1 });
      await ClubMember.collection.createIndex({ userId: 1 });
      
      // MembershipRequest indexes
      await MembershipRequest.collection.createIndex({ clubId: 1, userId: 1 }, { unique: true });
      await MembershipRequest.collection.createIndex({ status: 1 });
      await MembershipRequest.collection.createIndex({ clubId: 1 });
      
      console.log('   ✓ Created all database indexes');
    } catch (error) {
      // Indexes may already exist, which is fine
      console.log('   ℹ️ Some indexes may already exist (this is normal)');
    }
    
    console.log('✅ Migration 004 completed: Database indexes added');
  }

  /**
   * Migration 005: Update club member counts
   */
  async migration005_UpdateMemberCounts() {
    console.log('🔄 Migration 005: Updating club member counts...');
    
    const Club = mongoose.model('Club');
    const ClubMember = mongoose.model('ClubMember');
    
    const clubs = await Club.find({});
    
    for (let club of clubs) {
      const memberCount = await ClubMember.countDocuments({ clubId: club._id });
      if (club.memberCount !== memberCount) {
        club.memberCount = memberCount;
        await club.save();
        console.log(`   ✓ Updated ${club.name}: ${memberCount} members`);
      }
    }
    
    console.log(`✅ Migration 005 completed: Updated member counts for ${clubs.length} clubs`);
  }

  /**
   * Reset database (for development only)
   */
  async resetDatabase() {
    console.log('🧹 RESETTING DATABASE (Development Only)...');
    
    try {
      await this.connect();
      
      // Drop all collections
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.drop();
        console.log(`   ✓ Dropped collection: ${collection.collectionName}`);
      }
      
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Check database health and statistics
   */
  async checkDatabaseHealth() {
    console.log('🔍 Checking database health...');
    
    try {
      await this.connect();
      
      const User = mongoose.model('User');
      const Club = mongoose.model('Club');
      const ClubMember = mongoose.model('ClubMember');
      const MembershipRequest = mongoose.model('MembershipRequest');
      
      const stats = {
        users: await User.countDocuments(),
        superAdmins: await User.countDocuments({ role: 'super_admin' }),
        clubHeads: await User.countDocuments({ role: 'club_head' }),
        students: await User.countDocuments({ role: 'student' }),
        clubs: await Club.countDocuments(),
        activeClubs: await Club.countDocuments({ isActive: true }),
        memberships: await ClubMember.countDocuments(),
        pendingRequests: await MembershipRequest.countDocuments({ status: 'pending' }),
        approvedRequests: await MembershipRequest.countDocuments({ status: 'approved' }),
        rejectedRequests: await MembershipRequest.countDocuments({ status: 'rejected' })
      };
      
      console.log('📊 Database Statistics:');
      console.log(`   👤 Total Users: ${stats.users}`);
      console.log(`      - Super Admins: ${stats.superAdmins}`);
      console.log(`      - Club Heads: ${stats.clubHeads}`);
      console.log(`      - Students: ${stats.students}`);
      console.log(`   🏛️ Total Clubs: ${stats.clubs} (${stats.activeClubs} active)`);
      console.log(`   👥 Total Memberships: ${stats.memberships}`);
      console.log(`   📝 Membership Requests:`);
      console.log(`      - Pending: ${stats.pendingRequests}`);
      console.log(`      - Approved: ${stats.approvedRequests}`);
      console.log(`      - Rejected: ${stats.rejectedRequests}`);
      
      return stats;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
if (require.main === module) {
  const migration = new DatabaseMigration();
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      migration.runMigrations().catch(process.exit);
      break;
    case 'reset':
      migration.resetDatabase().catch(process.exit);
      break;
    case 'health':
      migration.checkDatabaseHealth().catch(process.exit);
      break;
    default:
      console.log('Usage:');
      console.log('  node migrate.js migrate  - Run all migrations');
      console.log('  node migrate.js reset    - Reset database (DEV ONLY)');
      console.log('  node migrate.js health   - Check database health');
      process.exit(1);
  }
}

module.exports = DatabaseMigration;
