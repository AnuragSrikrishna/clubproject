const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Import utilities
const connectDB = require('./utils/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import controllers
const { seedCategories } = require('./controllers/categoryController');
const seedSuperAdmin = require('./utils/seedSuperAdmin');
const seedSampleData = require('./utils/seedSampleData');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Static files
app.use('/uploads', express.static('./uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/announcements'));
app.use('/api', require('./routes/membership'));
app.use('/api/events', require('./routes/events'));
app.use('/api/test', require('./routes/test')); // Test routes (remove in production)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Seed initial data
const initializeData = async () => {
  await seedCategories();
  await seedSuperAdmin();
  // Add a small delay to ensure categories are created before clubs
  setTimeout(async () => {
    await seedSampleData();
  }, 1000);
};

// Temporarily comment out to debug
// initializeData();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = app;
