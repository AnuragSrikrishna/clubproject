# Testing Guide - College Clubs Management App

## 🎯 Pre-populated Test Data

The application automatically creates test data when you first start the backend server.

### Super Admin Account
```
📧 Email: admin@college.edu
🔐 Password: admin123
👤 Role: Super Admin
```

### Sample Students
```
📧 john.smith@college.edu    (Role: Student)
📧 sarah.johnson@college.edu (Role: Student)
📧 emily.wilson@college.edu  (Role: Student)
🔐 Password: password123 (for all)
```

### Sample Club Heads
```
📧 mike.davis@college.edu   (Role: Club Head)
📧 david.brown@college.edu  (Role: Club Head)
🔐 Password: password123 (for all)
```

### Sample Clubs
- **Programming Club** (Technology category)
- **Basketball Club** (Sports & Recreation category)
- **Art Society** (Arts & Culture category)

## 🧪 Testing Scenarios

### 1. Super Admin Testing
**Login:** `admin@college.edu` / `admin123`

**Test Cases:**
- ✅ Access Admin Dashboard
- ✅ View all users with search/filter
- ✅ Promote student to club head
- ✅ Demote club head to student
- ✅ Delete users (test safety checks)
- ✅ View system statistics
- ✅ Delete clubs

**Expected Results:**
- Can access all areas of the application
- Admin Dashboard shows user management interface
- Can modify user roles successfully
- Cannot delete own account
- Statistics show accurate counts

### 2. Club Head Testing
**Login:** `mike.davis@college.edu` / `password123`

**Test Cases:**
- ✅ Access "Create Club" in navigation
- ✅ Create a new club
- ✅ Manage own clubs
- ✅ Cannot access Admin Dashboard
- ✅ View joined clubs in dashboard

**Expected Results:**
- "Create Club" button visible in navigation
- Can successfully create new clubs
- Cannot access super admin functions
- Dashboard shows role-specific actions

### 3. Student Testing
**Login:** `john.smith@college.edu` / `password123`

**Test Cases:**
- ✅ Browse clubs page
- ✅ View club details
- ✅ Join clubs
- ✅ Cannot create clubs
- ✅ Cannot access Admin Dashboard

**Expected Results:**
- No "Create Club" button in navigation
- Can browse and join clubs
- Cannot access admin or club head functions
- Receives proper permission denied messages

### 4. User Registration Testing
**Test Cases:**
- ✅ Register new user
- ✅ Verify default role is "student"
- ✅ Login with new account
- ✅ Verify student-level permissions

**Expected Results:**
- New users automatically get "student" role
- Can access student-level features only
- Must be promoted by super admin to access higher privileges

## 🔄 Role Transition Testing

### Promote Student to Club Head
1. Login as Super Admin
2. Go to Admin Dashboard
3. Find a student user
4. Click "Edit" (pencil icon)
5. Change role to "Club Head"
6. Verify role change in user profile

### Test Club Head Permissions
1. Login as newly promoted club head
2. Verify "Create Club" appears in navigation
3. Create a test club
4. Verify club appears in system

### Demote Club Head to Student
1. Login as Super Admin
2. Go to Admin Dashboard
3. Find the club head
4. Change role back to "Student"
5. Verify "Create Club" button disappears

## 🌐 Frontend Testing

### Navigation Testing
- **All Users:** Home, Clubs, Dashboard, Profile
- **Club Heads:** + Create Club
- **Super Admins:** + Admin Dashboard

### Dashboard Testing
- **Students:** Shows joined clubs, browse clubs action
- **Club Heads:** + Create Club quick action
- **Super Admins:** + Admin Dashboard quick action

### Responsive Design Testing
- Test on different screen sizes
- Verify mobile navigation works
- Check card layouts on mobile/tablet

## 🔧 API Testing

### Authentication Endpoints
```bash
# Register new user
POST http://localhost:5000/api/auth/register
Content-Type: application/json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@college.edu",
  "password": "password123",
  "studentId": "TEST001",
  "year": "Sophomore",
  "major": "Computer Science"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json
{
  "email": "admin@college.edu",
  "password": "admin123"
}
```

### Admin Endpoints (Require Super Admin)
```bash
# Get dashboard stats
GET http://localhost:5000/api/admin/dashboard
Authorization: Bearer YOUR_JWT_TOKEN

# Get all users
GET http://localhost:5000/api/admin/users?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN

# Update user role
PUT http://localhost:5000/api/admin/users/USER_ID/role
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
{
  "role": "club_head"
}
```

## 🚨 Error Testing

### Permission Errors
- Try accessing admin dashboard as student
- Try creating club as student
- Try promoting users as club head

### Validation Errors
- Register with invalid email
- Create club with missing fields
- Login with wrong credentials

### Expected Error Messages
- "Access denied" for unauthorized actions
- "Invalid credentials" for wrong login
- "Missing required fields" for incomplete forms

## 📊 Data Verification

### Database Checks
1. Users have correct roles
2. Clubs have proper club heads
3. Membership relationships are accurate
4. Sample data is properly linked

### Frontend State Checks
1. User context updates on role change
2. Navigation updates based on role
3. Dashboard content changes with role
4. Protected routes work correctly

## 🎭 Demo Flow

### Complete Demo Scenario
1. **Start as Super Admin**
   - Show admin dashboard
   - Demonstrate user management
   - Promote a student to club head

2. **Switch to Club Head**
   - Show club creation
   - Demonstrate club management
   - Create a sample club

3. **Switch to Student**
   - Show limited permissions
   - Demonstrate club browsing
   - Join a club

4. **Return to Super Admin**
   - Show updated statistics
   - Demonstrate club oversight
   - Show system management capabilities

This comprehensive testing approach ensures all role-based features work correctly and provides a smooth demonstration of the application's capabilities.
