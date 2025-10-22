const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college-clubs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const resetUsers = async () => {
  try {
    console.log('🧹 Cleaning up existing users...');
    
    // Delete all users
    await User.deleteMany({});
    
    console.log('✅ All users deleted successfully');
    console.log('🔄 Restart the server to recreate fresh data');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning users:', error);
    process.exit(1);
  }
};

resetUsers();
