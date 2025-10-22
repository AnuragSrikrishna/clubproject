const User = require('../models/User');
const logger = require('./logger');

const seedSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      logger.info('Super admin already exists');
      return;
    }

    // Default super admin credentials
    const superAdminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@college.edu',
      password: 'admin123', // Will be hashed by the pre-save hook
      studentId: 'ADMIN001',
      role: 'super_admin',
      year: 'Graduate',
      major: 'Computer Science',
      bio: 'System Administrator',
      isActive: true
    };

    // Create super admin user (password will be hashed automatically)
    const superAdmin = await User.create(superAdminData);

    logger.info(`Super admin created successfully: ${superAdmin.email}`);
    console.log('\n🔑 DEFAULT SUPER ADMIN CREDENTIALS:');
    console.log('📧 Email: admin@college.edu');
    console.log('🔐 Password: admin123');
    console.log('⚠️  IMPORTANT: Change these credentials in production!\n');

  } catch (error) {
    logger.error('Error creating super admin:', error);
    console.error('❌ Failed to create super admin:', error.message);
  }
};

module.exports = seedSuperAdmin;
