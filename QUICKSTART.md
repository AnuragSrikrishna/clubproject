# College Clubs Management App - Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## Quick Setup

### Windows
```bash
# Run the setup script
setup.bat
```

### macOS/Linux
```bash
# Make the script executable and run
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Starting the Application

### 1. Start MongoDB
**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
Update the `MONGODB_URI` in `backend/.env` with your Atlas connection string.

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Environment Configuration

Update `backend/.env` with your specific settings:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-clubs
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

## First Time Usage

1. **Access the application** at http://localhost:3000
2. **Register a new account** using any email (college email format recommended)
3. **Explore the dashboard** and available features
4. **Create a club** to test admin functionality
5. **Browse clubs** to test the discovery features

## Demo Accounts

The application doesn't include pre-seeded users. Create test accounts with different roles:

- **Student Account**: Register normally
- **Club Admin**: Create a club to become an admin
- **Multiple Users**: Test membership requests and approvals

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check the `MONGODB_URI` in your `.env` file
- Verify network connectivity for MongoDB Atlas

**Port Already in Use:**
- Change the PORT in backend `.env` file
- Update the proxy configuration in frontend `vite.config.js`

**Dependencies Issues:**
- Delete `node_modules` folders and run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Logs Location
- Backend logs: `backend/logs/`
- Browser console for frontend issues
- MongoDB logs in your MongoDB installation directory

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a secure JWT secret
3. Configure production MongoDB instance
4. Set up process manager (PM2)

### Frontend
1. Build the frontend: `npm run build`
2. Serve static files with a web server (Nginx, Apache)
3. Configure proper routing for SPA

## API Testing

The backend provides these main endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/clubs` - Get all clubs
- `GET /api/categories` - Get categories

Use tools like Postman or curl to test the API directly.

## Development Tips

### Hot Reloading
Both frontend and backend support hot reloading:
- Frontend: Vite automatically reloads on file changes
- Backend: Nodemon restarts server on file changes

### Database Inspection
- Use MongoDB Compass for GUI access
- Use MongoDB shell for command-line access
- Check the logs for database operations

### Code Quality
- ESLint is configured for the frontend
- Use proper error handling patterns
- Follow the established logging patterns

## Need Help?

1. Check the main README.md for detailed documentation
2. Review the application logs for error details
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set

The application includes comprehensive error handling and logging to help identify and resolve issues quickly.
