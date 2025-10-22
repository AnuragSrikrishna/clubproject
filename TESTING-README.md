# 🧪 Comprehensive Testing System

This testing system ensures all features of the College Clubs App work correctly and prevents regression when implementing new features.

## 📋 Overview

The testing system includes:
- **Backend API Tests**: Automated testing of all API endpoints
- **Frontend UI Tests**: Interactive testing via web interface  
- **Feature Flow Documentation**: Complete mapping of all app functionality
- **Test Automation Scripts**: Cross-platform test runners

## 🚀 Quick Start

### Prerequisites
✅ **Deployment System**: Use the new deployment scripts for automatic setup

### Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\deploy.ps1 setup
.\deploy.ps1 start
```

**Windows (Command Prompt):**
```cmd
deploy.bat setup
deploy.bat start
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh setup
./deploy.sh start
```

### Manual Setup (Alternative)
1. **Backend server running**: `cd backend && npm start`
2. **Frontend server running**: `cd frontend && npm run dev`
3. **MongoDB database connected** (via Docker or cloud)

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000  
- **MongoDB Admin**: http://localhost:8081 (admin/admin123)

### Run All Tests

**Using Deployment Scripts (Recommended):**
```powershell
.\deploy.ps1 test
```

**Manual Testing:**

**Manual Testing:**

**Windows (PowerShell - Legacy):**
```powershell
.\run-tests.ps1
```

**Windows (Command Prompt - Legacy):**
```cmd
run-tests.bat
```

**Linux/Mac (Legacy):**
```bash
./run-tests.sh
```

> **Note**: The legacy test scripts have been replaced by the unified deployment system. Use `.\deploy.ps1 test` for comprehensive testing.

## 📊 Test Types

### 1. Backend API Tests (`test-api.js`)

Automated testing of all backend endpoints:

**Authentication Tests:**
- ✅ User registration
- ✅ Login with correct credentials  
- ✅ Login with wrong credentials (should fail)
- ✅ Protected route access with token
- ✅ Protected route access without token (should fail)
- ✅ Token-based authentication flow

**Club Management Tests:**
- ✅ Get clubs list (with authentication)
- ✅ Get clubs without authentication (should fail)
- ✅ Get club details
- ✅ Create club (role-based permissions)
- ✅ Get user's clubs

**Membership Flow Tests:**
- ✅ Check membership status
- ✅ Request to join club
- ✅ Prevent duplicate join requests
- ✅ View membership requests (role-based)
- ✅ Approve/reject membership requests

**Dashboard & Stats Tests:**
- ✅ Get dashboard statistics
- ✅ Dashboard access control
- ✅ User events endpoint

**Profile Management Tests:**
- ✅ View user profile
- ✅ Update profile information
- ✅ Change password

**Database Integrity Tests:**
- ✅ Server health check
- ✅ Database connection status
- ✅ Categories data loading

### 2. Frontend UI Tests (`TestPage.jsx`)

Interactive testing via web interface at `/test`:

**Authentication Suite:**
- Login as Admin, Club Head, Student
- Wrong credentials handling
- Logout functionality
- Protected route access
- Token persistence

**Dashboard Suite:**
- Dashboard loading
- Statistics display
- User clubs display
- Recent activities
- Unauthorized access prevention

**Club Management Suite:**
- Clubs list loading
- Club details view
- Search and filtering
- Join club flow
- Membership status checking

**Profile Suite:**
- Profile viewing
- Profile updates
- Password changes
- Input validation
- Unauthorized access prevention

**Events Suite:**
- Events loading
- Event filtering
- User-specific events
- Unauthorized access prevention

## 🎯 Test Credentials

Use these credentials for testing:

```javascript
// Super Admin
Email: admin@college.edu
Password: admin123

// Club Head  
Email: jane@college.edu
Password: password123

// Student
Email: alice@college.edu
Password: password123
```

## 📈 Running Specific Tests

### Using Deployment Scripts (Recommended)
```bash
# Full test suite
.\deploy.ps1 test

# Check service status  
.\deploy.ps1 status

# View application logs
.\deploy.ps1 logs

# Stop all services
.\deploy.ps1 stop

# Clean restart
.\deploy.ps1 clean
.\deploy.ps1 start
```

### Legacy Test Commands
```bash
# PowerShell (Legacy)
.\run-tests.ps1 backend

# Command Prompt (Legacy)
run-tests.bat backend  

# Linux/Mac (Legacy)
./run-tests.sh backend
```

### Manual Backend Test
```bash
cd backend
node test-api.js
```

### Manual Frontend Test
1. Open browser: `http://localhost:5173/test`
2. Login with test credentials
3. Click "Run All Tests"
4. Review results in real-time

## 📋 Feature Flow Reference

### Authentication Flow
1. **Registration** → Create account → Email verification (optional)
2. **Login** → Validate credentials → Issue JWT token → Redirect to dashboard
3. **Logout** → Clear token → Redirect to home
4. **Password Reset** → Email link → Verify token → Update password

### Club Management Flow
1. **Browse Clubs** → View list → Search/filter → View details
2. **Join Club** → Request membership → Approval process → Membership confirmed
3. **Club Administration** → Manage members → Approve requests → Create events
4. **Create Club** → Admin only → Set details → Assign club head

### Dashboard Flow
1. **Student Dashboard** → My clubs → My events → Recommendations
2. **Club Head Dashboard** → Manage club → Member requests → Create events
3. **Admin Dashboard** → All clubs → All users → System stats → Site management

### Profile Management Flow
1. **View Profile** → Display info → Show memberships → Activity history
2. **Edit Profile** → Update details → Change avatar → Save changes
3. **Change Password** → Verify current → Set new → Confirm change

## 🔧 Maintenance

### Adding New Tests

**Backend Tests** (`backend/test-api.js`):
```javascript
const testNewFeature = async () => {
  log.info('Testing new feature...');
  const result = await makeRequest('GET', '/api/new-endpoint', null, token);
  if (result.success) {
    testSuccess('New Feature Test');
  } else {
    testFailed('New Feature Test', result.error);
  }
};
```

**Frontend Tests** (`frontend/src/pages/TestPage.jsx`):
```javascript
case 'new-feature-test':
  const newFeatureData = await API.get('/new-endpoint');
  if (newFeatureData.data.success) {
    testSuccess('New Feature Test');
  } else {
    testFailed('New Feature Test', 'Failed to load new feature');
  }
  break;
```

### Updating Test Credentials

Update credentials in:
1. `backend/test-api.js` - `testUsers` object
2. `frontend/src/pages/TestPage.jsx` - `testCredentials` object
3. Test documentation

### Adding New Test Suites

1. **Backend**: Add new test function to `test-api.js`
2. **Frontend**: Add new test suite to `testSuites` array in `TestPage.jsx`
3. Update documentation

## 🚨 Troubleshooting

### Common Issues

**Backend tests fail with "Server not running":**
```bash
cd backend
npm start
# Wait for "Server is running on port 5000"
```

**Frontend tests show "Not authenticated":**
- Clear browser cache and cookies
- Try login with fresh session
- Check if backend server is running

**Database connection errors:**
```bash
# Check MongoDB container
docker ps
docker-compose up -d mongodb

# Check connection
curl http://localhost:5000/api/health
```

**Port conflicts:**
- Backend: Change port in `server-mongodb.js` and test files
- Frontend: Change port in `vite.config.js` and test files

### Test Data Issues

**Reset test database:**
```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Restart with fresh data
docker-compose up -d
```

**Verify sample data:**
```bash
curl http://localhost:5000/api/health
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/clubs
```

## 📊 Test Results Interpretation

### Backend Test Output
- ✅ **Green**: Test passed successfully
- ❌ **Red**: Test failed - check error details
- ℹ️ **Blue**: Informational message
- ⚠️ **Yellow**: Warning or expected failure

### Frontend Test Dashboard
- **Success Count**: Number of passed tests
- **Failed Count**: Number of failed tests  
- **Test Logs**: Real-time execution details
- **Suite Status**: Overall status per test category

## 🛡️ Security Testing

The test suite includes security validations:
- Authentication bypass attempts
- Authorization level checking
- Input validation testing
- CORS and security headers
- Rate limiting verification

## 🔄 Continuous Testing

### Before Code Changes
```bash
# Run full test suite
.\run-tests.ps1

# Verify all green before making changes
```

### After Code Changes  
```bash
# Run tests again
.\run-tests.ps1

# Compare results
# Fix any new failures before committing
```

### Integration with Development
1. Run tests before each commit
2. Include test results in pull requests
3. Update tests when adding features
4. Document any test changes

## 📝 Test Coverage

Current test coverage includes:
- **Authentication**: 100% endpoint coverage
- **Club Management**: 100% CRUD operations
- **Membership Flow**: 100% workflow coverage  
- **Profile Management**: 100% user operations
- **Authorization**: 100% role-based access
- **Error Handling**: Comprehensive error scenarios

## 🎯 Best Practices

1. **Always test before and after changes**
2. **Keep test credentials separate from production**
3. **Update tests when adding new features**
4. **Review test logs for warnings**
5. **Maintain test documentation**
6. **Use descriptive test names**
7. **Include both positive and negative test cases**
8. **Test error handling scenarios**
9. **Verify security controls**
10. **Document expected behavior**
