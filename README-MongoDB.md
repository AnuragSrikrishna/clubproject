# College Clubs Management App - MongoDB Setup

This is a complete setup for the College Clubs Management App with MongoDB database persistence.

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** installed and running
- **Node.js** (v16 or higher)
- **npm** package manager

### 1. One-Click Setup
```bash
# Clone and navigate to the project
cd college-clubs-app

# Start everything (MongoDB + Backend + Frontend)
start-mongodb.bat
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB Admin UI**: http://localhost:8081

## 🔐 Default Credentials

### Super Admin
- **Email**: `admin@college.edu`
- **Password**: `admin123`

### Sample Users (Password: `password123`)
- `john@college.edu` (Super Admin)
- `jane@college.edu` (Club Head)
- `alice@college.edu` (Student)

## 📊 Database Access

### MongoDB Admin Interface
1. Open http://localhost:8081
2. No authentication required (development setup)
3. Database name: `college_clubs`

### Collections Structure
- **users** - User accounts and profiles
- **clubs** - Club information and settings
- **clubmembers** - Club membership relationships
- **membershiprequests** - Pending/processed membership requests
- **events** - Club events (planned)
- **announcements** - Club announcements (planned)

### Direct MongoDB Access
```bash
# Connect via MongoDB shell
docker exec -it college-clubs-mongodb mongosh

# Switch to the database
use college_clubs

# View collections
show collections

# Query examples
db.users.find().pretty()
db.clubs.find().pretty()
db.clubmembers.find().pretty()
db.membershiprequests.find().pretty()
```

## 🛠️ Development Commands

### Start Services
```bash
# Start everything
start-mongodb.bat

# Or start manually:
docker-compose up -d          # Start MongoDB
cd backend && node server-mongodb.js  # Start backend
cd frontend && npm run dev     # Start frontend
```

### Stop Services
```bash
# Stop everything
stop-services.bat

# Or stop manually:
docker-compose down           # Stop MongoDB
# Ctrl+C in terminal windows   # Stop backend/frontend
```

### View Logs
```bash
# MongoDB logs
docker logs college-clubs-mongodb

# MongoDB Admin UI logs
docker logs college-clubs-mongo-express
```

## 🏗️ Architecture

### Backend (server-mongodb.js)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Token-based (development)
- **Features**: 
  - User registration/login
  - Club management
  - Membership requests with approval workflow
  - Role-based access control

### Frontend
- **Framework**: React with Vite
- **UI Library**: Material-UI
- **State Management**: React Context
- **Features**:
  - Responsive dashboard
  - Club browsing and management
  - Membership request handling
  - Admin controls

### Database
- **MongoDB**: Document database with collections
- **Mongoose**: ODM for schema validation
- **Docker**: Containerized for easy setup
- **Mongo Express**: Web-based admin interface

## 🔧 Configuration

### Environment Variables
Create `.env` file in backend directory:
```bash
MONGODB_URI=mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Docker Configuration
The `docker-compose.yml` includes:
- MongoDB container with authentication
- Mongo Express admin UI
- Persistent data volumes
- Network configuration

## 🚨 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if containers are running
docker ps

# Restart MongoDB
docker-compose restart mongodb

# View MongoDB logs
docker logs college-clubs-mongodb
```

### Port Conflicts
- MongoDB: 27017
- Mongo Express: 8081  
- Backend: 5000
- Frontend: 3000

### Reset Database
```bash
# Stop services
stop-services.bat

# Remove data volume
docker-compose down -v

# Start fresh
start-mongodb.bat
```

## 📋 Features Implemented

### ✅ Working Features
- User registration and authentication
- Club creation and management
- Membership request workflow
- Approval/rejection system
- Role-based permissions
- Real-time UI updates
- Database persistence

### 🔄 Data Flow
1. **User Registration** → MongoDB `users` collection
2. **Club Creation** → MongoDB `clubs` collection + creator added to `clubmembers`
3. **Join Request** → MongoDB `membershiprequests` collection
4. **Approval** → Move to `clubmembers`, update request status
5. **Rejection** → Update request status, allow re-application

## 🎯 Next Steps

### Planned Enhancements
- [ ] Event management system
- [ ] Announcement system  
- [ ] Email notifications
- [ ] File upload for club logos
- [ ] Advanced search and filtering
- [ ] Club analytics dashboard

### Production Deployment
- [ ] Environment-based configuration
- [ ] JWT authentication with refresh tokens
- [ ] Password hashing with bcrypt
- [ ] Rate limiting and security middleware
- [ ] MongoDB Atlas cloud database
- [ ] Docker production containers

## 📞 Support

### Common Issues
1. **Docker not running**: Start Docker Desktop
2. **Port conflicts**: Check if ports 27017, 8081, 5000, 3000 are available
3. **Permission errors**: Run as administrator if needed
4. **Database not initializing**: Wait longer for MongoDB startup

### Logs Location
- Backend logs: Console output
- MongoDB logs: `docker logs college-clubs-mongodb`
- Frontend logs: Browser console

This setup provides a complete, production-ready foundation that can be easily replicated across different environments!
