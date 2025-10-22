# 🧪 College Clubs App - Feature Flow & Testing Guide

## 📋 **Complete Feature Flow**

### **1. Authentication Flow**
```
1. User Registration
   ├── POST /api/auth/register
   ├── Validates input fields
   ├── Checks for existing user
   ├── Hashes password with bcrypt
   ├── Creates user in database
   └── Returns JWT token + user data

2. User Login
   ├── POST /api/auth/login
   ├── Validates credentials
   ├── Compares password with bcrypt
   ├── Generates demo token
   └── Returns token + user data

3. Token Verification
   ├── GET /api/auth/me
   ├── Validates Bearer token
   └── Returns current user data

4. Profile Management
   ├── PUT /api/auth/profile (update profile)
   └── PUT /api/auth/password (change password)
```

### **2. Club Management Flow**
```
1. View All Clubs (Authenticated Users Only)
   ├── GET /api/clubs
   ├── Requires authentication
   ├── Supports pagination, search, filtering
   └── Returns clubs with member counts

2. View Club Details
   ├── GET /api/clubs/:id
   ├── Shows club info, members, events
   └── Shows membership status for current user

3. Create Club (Super Admin Only)
   ├── POST /api/clubs
   ├── Creates club in database
   └── Adds creator as first member

4. Get User's Clubs
   ├── GET /api/clubs/user/my-clubs
   ├── Shows clubs user has joined
   └── Indicates admin status
```

### **3. Membership Request Flow**
```
1. Join Club Request
   ├── POST /api/clubs/:clubId/join
   ├── Checks if already member
   ├── Checks for pending requests
   └── Creates request or direct membership

2. View Membership Requests (Club Admins Only)
   ├── GET /api/clubs/:clubId/membership-requests
   ├── Shows pending requests
   └── Returns user details

3. Approve/Reject Requests (Club Admins Only)
   ├── PUT /api/clubs/:clubId/membership-requests/:requestId/accept
   ├── PUT /api/clubs/:clubId/membership-requests/:requestId/reject
   └── Updates request status + creates membership

4. Check Membership Status
   ├── GET /api/clubs/:clubId/membership-status
   └── Returns current membership/request status
```

### **4. Dashboard & Data Flow**
```
1. Dashboard Stats
   ├── GET /api/dashboard/stats
   ├── Requires authentication
   └── Returns user-specific statistics

2. User Events (Placeholder)
   ├── GET /api/events/user/my-events
   └── Returns empty array for now

3. Club Members
   ├── GET /api/clubs/:clubId/members
   └── Returns member list for club
```

## 🎯 **User Role Permissions**

### **Student**
- ✅ View clubs (with login)
- ✅ Join clubs / Request membership
- ✅ View own clubs
- ✅ Update own profile
- ❌ Create clubs
- ❌ Manage membership requests

### **Club Head**
- ✅ All Student permissions
- ✅ Manage membership requests for their clubs
- ✅ View club member lists
- ❌ Create new clubs
- ❌ Manage other clubs

### **Super Admin**
- ✅ All permissions
- ✅ Create clubs
- ✅ Manage any club
- ✅ View all data

## 🧪 **Testing Checklist**

### **Authentication Tests**
- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Access protected routes without token (should fail)
- [ ] Access protected routes with valid token
- [ ] Update profile information
- [ ] Change password

### **Club Management Tests**
- [ ] View clubs without login (should fail)
- [ ] View clubs with login
- [ ] Create club as student (should fail)
- [ ] Create club as super admin
- [ ] View club details
- [ ] Get user's enrolled clubs

### **Membership Tests**
- [ ] Join club (direct joining)
- [ ] Request club membership (requires approval)
- [ ] View membership requests as non-admin (should fail)
- [ ] View membership requests as club admin
- [ ] Approve membership request
- [ ] Reject membership request
- [ ] Try to join club again (should fail)

### **Authorization Tests**
- [ ] Student accessing admin endpoints (should fail)
- [ ] Club head managing other clubs (should fail)
- [ ] Super admin accessing everything

### **Data Integrity Tests**
- [ ] Database has sample data
- [ ] Passwords are hashed
- [ ] Member counts are accurate
- [ ] Request statuses update correctly
