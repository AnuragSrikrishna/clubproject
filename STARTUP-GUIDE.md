# 🚀 Fresh Startup Guide

## Prerequisites Check
Before starting, ensure you have:
- ✅ Docker Desktop installed and running
- ✅ Node.js (v16+) installed
- ✅ npm package manager

## Quick Start (One Command)
```bash
cd c:\t1\college-clubs-app
start-mongodb.bat
```

## Manual Startup (Step by Step)

### Step 1: Start MongoDB Database
```bash
# From the project root directory
docker-compose up -d
```
Wait 10-15 seconds for MongoDB to initialize.

### Step 2: Start Backend Server
```bash
# Open new terminal window
cd backend
node server-mongodb.js
```
Keep this terminal open - you'll see MongoDB connection logs.

### Step 3: Start Frontend Server  
```bash
# Open another new terminal window
cd frontend
npm run dev
```
Keep this terminal open - you'll see Vite development server logs.

## Access Points
- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB Admin**: http://localhost:8081

## Login Credentials
### Super Admin
- Email: `admin@college.edu`
- Password: `admin123`

### Sample Users (password: `password123`)
- `john@college.edu` (Super Admin)
- `jane@college.edu` (Club Head)
- `alice@college.edu` (Student)

## Troubleshooting

### If Docker isn't running:
1. Start Docker Desktop
2. Wait for it to fully initialize
3. Try again

### If ports are busy:
Check what's using the ports:
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :27017
netstat -ano | findstr :8081
```

### If services won't start:
1. Stop everything: `stop-services.bat`
2. Wait 30 seconds
3. Start fresh: `start-mongodb.bat`

### Fresh Database Reset:
```bash
# Stop everything
stop-services.bat

# Remove database data
docker-compose down -v

# Start fresh with new data
start-mongodb.bat
```

### Database Management Commands:
```bash
# Seed database with sample data
db-management.bat seed

# Run database migrations
db-management.bat migrate

# Check database health and statistics
db-management.bat health

# Reset database (WARNING: Deletes all data)
db-management.bat reset
```

## Verify Everything is Working

### 1. Check MongoDB Admin UI
- Go to http://localhost:8081
- **Login with**:
  - Username: `admin`
  - Password: `admin123`
- Database name: `college_clubs`
- Collections: users, clubs, clubmembers, membershiprequests

### 2. Check Frontend
- Go to http://localhost:3000
- You should see the login page
- Try logging in with admin credentials

### 3. Check Backend API
- Backend should be running on http://localhost:5000
- MongoDB connection logs should show "Connected to MongoDB"

## Complete Fresh Install

If you need to reinstall everything from scratch:

### 1. Clean Up
```bash
# Stop all services
stop-services.bat

# Remove Docker containers and volumes
docker-compose down -v
docker system prune -f

# Remove node_modules (optional)
rmdir /s frontend\node_modules
rmdir /s backend\node_modules
```

### 2. Reinstall Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies  
cd ..\backend
npm install
```

### 3. Start Fresh
```bash
cd ..
start-mongodb.bat
```

## What Gets Created on First Run

The system automatically creates comprehensive sample data:

### 📊 Database Collections:
- **users** - 10 diverse users with complete profiles
- **clubs** - 9 clubs across different categories  
- **clubmembers** - 29 membership relationships
- **membershiprequests** - 9 requests with various statuses

### 👤 Sample Users:
- **Super Admins**: admin@college.edu, john@college.edu
- **Club Heads**: jane@college.edu, carol@college.edu  
- **Students**: alice@college.edu, bob@college.edu, david@college.edu, emma@college.edu, frank@college.edu, grace@college.edu

### 🏛️ Sample Clubs:
- **Technology**: Programming Club, Robotics Club
- **Arts**: Photography Club, Music Club, Drama Club
- **Academic**: Debate Club, Art History Society
- **Games**: Chess Club
- **Service**: Environmental Club

### 📝 Membership Requests:
- **Pending**: 5 requests awaiting approval
- **Approved**: 2 accepted requests  
- **Rejected**: 2 declined requests

### 🎯 Complete Test Scenarios:
The seeded data includes realistic scenarios for testing:
- Club creation and management
- Membership approval workflows
- Different user roles and permissions
- Various club categories and types
- Request/approval/rejection flows

Everything is ready to use immediately after startup!
