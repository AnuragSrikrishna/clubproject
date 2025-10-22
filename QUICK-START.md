# 🚀 College Clubs App - Quick Start Guide

## Single Command Startup

### Option 1: Batch File (Recommended for Windows)
```cmd
.\start-app.bat
```

### Option 2: NPM Scripts
```bash
npm start
```

### Option 3: PowerShell Script
```powershell
.\start-app.ps1
```

## What Gets Started

- **Backend Server**: http://localhost:5000 (Express + MongoDB)
- **Frontend Server**: http://localhost:3000 (React + Vite)
- **Test Page**: http://localhost:3000/test

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | admin@college.edu | admin123 |
| 👔 **Club Head** | jane@college.edu | password123 |
| 🎓 **Student** | alice@college.edu | password123 |

## 🧪 Testing

### Backend API Tests
```bash
cd backend
node test-api.js
```

### Frontend UI Tests
Visit: http://localhost:3000/test

## 📋 Manual Startup (if needed)

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

## 🛠️ Troubleshooting

### Ports Already in Use
- **Backend (5000)**: `taskkill /f /im node.exe`
- **Frontend (3000)**: Check for existing Vite/React processes

### MongoDB Issues
```bash
docker-compose up -d mongodb
```

### Dependencies Issues
```bash
npm run install-all
```

## 🎯 Development Workflow

1. **Start servers**: `.\start-app.bat`
2. **Run tests**: Visit http://localhost:3000/test
3. **Make changes**: Edit code (hot reload enabled)
4. **Test changes**: Re-run test suite
5. **Commit**: Git commit when tests pass

## 📱 Application Features

- ✅ User Authentication & Authorization
- ✅ Club Management & Membership
- ✅ Role-based Access Control
- ✅ Dashboard & Statistics
- ✅ Comprehensive Testing Suite
- ✅ Hot Reload Development
