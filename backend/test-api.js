const axios = require('axios');
const colors = require('colors');

// Base URL for API
const BASE_URL = 'http://localhost:5000';

// Test data
const testUsers = {
  admin: { email: 'admin@college.edu', password: 'admin123' },
  clubHead: { email: 'jane@college.edu', password: 'password123' },
  student: { email: 'alice@college.edu', password: 'password123' },
  newUser: { 
    firstName: 'Test', 
    lastName: 'User', 
    email: 'test@college.edu', 
    password: 'test123',
    role: 'student' 
  }
};

// Store tokens and IDs for tests
const testState = {
  tokens: {},
  clubId: null,
  requestId: null,
  newUserId: null
};

// Helper functions
const log = {
  success: (message) => console.log('✅'.green + ' ' + message.green),
  error: (message) => console.log('❌'.red + ' ' + message.red),
  info: (message) => console.log('ℹ️'.blue + ' ' + message.blue),
  warning: (message) => console.log('⚠️'.yellow + ' ' + message.yellow),
  section: (message) => console.log('\n' + '🔷'.cyan + ' ' + message.cyan.bold)
};

const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Test functions
const testAuthentication = async () => {
  log.section('TESTING AUTHENTICATION');
  
  // Test 1: Register new user
  log.info('Testing user registration...');
  const registerResult = await makeRequest('POST', '/api/auth/register', testUsers.newUser);
  if (registerResult.success) {
    log.success('✓ User registration successful');
    testState.tokens.newUser = registerResult.data.token;
    testState.newUserId = registerResult.data.user._id;
  } else {
    log.error('✗ User registration failed: ' + JSON.stringify(registerResult.error));
  }
  
  // Test 2: Login with admin credentials
  log.info('Testing admin login...');
  const adminLogin = await makeRequest('POST', '/api/auth/login', testUsers.admin);
  if (adminLogin.success) {
    log.success('✓ Admin login successful');
    testState.tokens.admin = adminLogin.data.token;
  } else {
    log.error('✗ Admin login failed: ' + JSON.stringify(adminLogin.error));
  }
  
  // Test 3: Login with club head credentials
  log.info('Testing club head login...');
  const clubHeadLogin = await makeRequest('POST', '/api/auth/login', testUsers.clubHead);
  if (clubHeadLogin.success) {
    log.success('✓ Club head login successful');
    testState.tokens.clubHead = clubHeadLogin.data.token;
  } else {
    log.error('✗ Club head login failed: ' + JSON.stringify(clubHeadLogin.error));
  }
  
  // Test 4: Login with student credentials
  log.info('Testing student login...');
  const studentLogin = await makeRequest('POST', '/api/auth/login', testUsers.student);
  if (studentLogin.success) {
    log.success('✓ Student login successful');
    testState.tokens.student = studentLogin.data.token;
  } else {
    log.error('✗ Student login failed: ' + JSON.stringify(studentLogin.error));
  }
  
  // Test 5: Login with wrong credentials
  log.info('Testing login with wrong credentials...');
  const wrongLogin = await makeRequest('POST', '/api/auth/login', { 
    email: 'admin@college.edu', 
    password: 'wrongpassword' 
  });
  if (!wrongLogin.success && wrongLogin.status === 401) {
    log.success('✓ Wrong credentials correctly rejected');
  } else {
    log.error('✗ Wrong credentials should be rejected');
  }
  
  // Test 6: Access protected route with token
  log.info('Testing protected route access...');
  const meResult = await makeRequest('GET', '/api/auth/me', null, testState.tokens.admin);
  if (meResult.success) {
    log.success('✓ Protected route accessible with token');
  } else {
    log.error('✗ Protected route should be accessible with token');
  }
  
  // Test 7: Access protected route without token
  log.info('Testing protected route without token...');
  const noTokenResult = await makeRequest('GET', '/api/auth/me');
  if (!noTokenResult.success && noTokenResult.status === 401) {
    log.success('✓ Protected route correctly requires authentication');
  } else {
    log.error('✗ Protected route should require authentication');
  }
};

const testClubManagement = async () => {
  log.section('TESTING CLUB MANAGEMENT');
  
  // Test 1: Access clubs without authentication
  log.info('Testing clubs access without authentication...');
  const noAuthClubs = await makeRequest('GET', '/api/clubs');
  if (!noAuthClubs.success && noAuthClubs.status === 401) {
    log.success('✓ Clubs endpoint correctly requires authentication');
  } else {
    log.error('✗ Clubs endpoint should require authentication');
  }
  
  // Test 2: Get clubs with authentication
  log.info('Testing clubs access with authentication...');
  const clubsResult = await makeRequest('GET', '/api/clubs', null, testState.tokens.student);
  if (clubsResult.success && clubsResult.data.data) {
    log.success(`✓ Retrieved ${clubsResult.data.data.length} clubs`);
    if (clubsResult.data.data.length > 0) {
      testState.clubId = clubsResult.data.data[0]._id;
      log.info(`Using club ID: ${testState.clubId} for further tests`);
    }
  } else {
    log.error('✗ Failed to retrieve clubs: ' + JSON.stringify(clubsResult.error));
  }
  
  // Test 3: Get club details
  if (testState.clubId) {
    log.info('Testing club details...');
    const clubDetails = await makeRequest('GET', `/api/clubs/${testState.clubId}`, null, testState.tokens.student);
    if (clubDetails.success) {
      log.success('✓ Club details retrieved successfully');
    } else {
      log.error('✗ Failed to retrieve club details');
    }
  }
  
  // Test 4: Create club as student (should fail)
  log.info('Testing club creation as student (should fail)...');
  const newClub = {
    name: 'Test Club',
    description: 'A test club',
    category: { _id: 'cat1', name: 'Technology', color: '#2196F3', icon: '💻' },
    contactEmail: 'test@college.edu'
  };
  const studentCreateClub = await makeRequest('POST', '/api/clubs', newClub, testState.tokens.student);
  if (!studentCreateClub.success) {
    log.success('✓ Students correctly cannot create clubs');
  } else {
    log.warning('⚠️ Students should not be able to create clubs');
  }
  
  // Test 5: Create club as admin
  log.info('Testing club creation as admin...');
  const adminCreateClub = await makeRequest('POST', '/api/clubs', newClub, testState.tokens.admin);
  if (adminCreateClub.success) {
    log.success('✓ Admin successfully created club');
  } else {
    log.error('✗ Admin should be able to create clubs: ' + JSON.stringify(adminCreateClub.error));
  }
  
  // Test 6: Get user's clubs
  log.info('Testing user\'s clubs retrieval...');
  const myClubs = await makeRequest('GET', '/api/clubs/user/my-clubs', null, testState.tokens.student);
  if (myClubs.success) {
    log.success(`✓ Retrieved user's clubs: ${myClubs.data.data.length} clubs`);
  } else {
    log.error('✗ Failed to retrieve user\'s clubs: ' + JSON.stringify(myClubs.error));
  }
};

const testMembershipFlow = async () => {
  log.section('TESTING MEMBERSHIP FLOW');
  
  if (!testState.clubId) {
    log.error('No club ID available for membership tests');
    return;
  }
  
  // Test 1: Check membership status
  log.info('Testing membership status check...');
  const statusResult = await makeRequest('GET', `/api/clubs/${testState.clubId}/membership-status`, null, testState.tokens.newUser);
  if (statusResult.success) {
    log.success('✓ Membership status retrieved');
    log.info(`Status: ${JSON.stringify(statusResult.data.data)}`);
  } else {
    log.error('✗ Failed to get membership status');
  }
  
  // Test 2: Request to join club
  log.info('Testing club join request...');
  const joinRequest = await makeRequest('POST', `/api/clubs/${testState.clubId}/join`, 
    { message: 'I would like to join this club for testing purposes.' }, 
    testState.tokens.newUser
  );
  if (joinRequest.success) {
    log.success('✓ Join request submitted successfully');
    if (joinRequest.data.requiresApproval) {
      log.info('Club requires approval - request is pending');
    } else {
      log.info('Club allows direct joining');
    }
  } else {
    log.error('✗ Failed to submit join request: ' + JSON.stringify(joinRequest.error));
  }
  
  // Test 3: Try to join same club again (should fail)
  log.info('Testing duplicate join request (should fail)...');
  const duplicateJoin = await makeRequest('POST', `/api/clubs/${testState.clubId}/join`, 
    { message: 'Trying to join again' }, 
    testState.tokens.newUser
  );
  if (!duplicateJoin.success) {
    log.success('✓ Duplicate join request correctly rejected');
  } else {
    log.error('✗ Duplicate join requests should be rejected');
  }
  
  // Test 4: View membership requests as non-admin (should fail)
  log.info('Testing membership requests access as student (should fail)...');
  const studentViewRequests = await makeRequest('GET', `/api/clubs/${testState.clubId}/membership-requests`, null, testState.tokens.student);
  if (!studentViewRequests.success && studentViewRequests.status === 403) {
    log.success('✓ Non-admins correctly cannot view membership requests');
  } else {
    log.error('✗ Only admins should view membership requests');
  }
  
  // Test 5: View membership requests as club admin
  log.info('Testing membership requests access as club admin...');
  const adminViewRequests = await makeRequest('GET', `/api/clubs/${testState.clubId}/membership-requests`, null, testState.tokens.clubHead);
  if (adminViewRequests.success) {
    log.success(`✓ Club admin can view membership requests: ${adminViewRequests.data.data.length} requests`);
    if (adminViewRequests.data.data.length > 0) {
      testState.requestId = adminViewRequests.data.data[0]._id;
    }
  } else {
    log.error('✗ Club admin should be able to view membership requests');
  }
  
  // Test 6: Approve membership request
  if (testState.requestId) {
    log.info('Testing membership request approval...');
    const approveResult = await makeRequest('PUT', `/api/clubs/${testState.clubId}/membership-requests/${testState.requestId}/accept`, 
      {}, testState.tokens.clubHead
    );
    if (approveResult.success) {
      log.success('✓ Membership request approved successfully');
    } else {
      log.error('✗ Failed to approve membership request: ' + JSON.stringify(approveResult.error));
    }
  }
};

const testDashboardAndStats = async () => {
  log.section('TESTING DASHBOARD & STATS');
  
  // Test 1: Get dashboard stats without auth (should fail)
  log.info('Testing dashboard stats without authentication...');
  const noAuthStats = await makeRequest('GET', '/api/dashboard/stats');
  if (!noAuthStats.success && noAuthStats.status === 401) {
    log.success('✓ Dashboard stats correctly requires authentication');
  } else {
    log.error('✗ Dashboard stats should require authentication');
  }
  
  // Test 2: Get dashboard stats with auth
  log.info('Testing dashboard stats with authentication...');
  const statsResult = await makeRequest('GET', '/api/dashboard/stats', null, testState.tokens.admin);
  if (statsResult.success) {
    log.success('✓ Dashboard stats retrieved successfully');
    log.info(`Stats: ${JSON.stringify(statsResult.data.data)}`);
  } else {
    log.error('✗ Failed to retrieve dashboard stats');
  }
  
  // Test 3: Get user events
  log.info('Testing user events endpoint...');
  const eventsResult = await makeRequest('GET', '/api/events/user/my-events', null, testState.tokens.student);
  if (eventsResult.success) {
    log.success('✓ User events endpoint working');
  } else {
    log.error('✗ User events endpoint failed');
  }
};

const testProfileManagement = async () => {
  log.section('TESTING PROFILE MANAGEMENT');
  
  // Test 1: Update profile
  log.info('Testing profile update...');
  const profileUpdate = {
    firstName: 'Updated',
    lastName: 'Name',
    studentId: 'TEST001',
    year: '3rd Year',
    major: 'Testing'
  };
  const updateResult = await makeRequest('PUT', '/api/auth/profile', profileUpdate, testState.tokens.newUser);
  if (updateResult.success) {
    log.success('✓ Profile updated successfully');
  } else {
    log.error('✗ Failed to update profile: ' + JSON.stringify(updateResult.error));
  }
  
  // Test 2: Change password
  log.info('Testing password change...');
  const passwordChange = {
    currentPassword: 'test123',
    newPassword: 'newtest123'
  };
  const passwordResult = await makeRequest('PUT', '/api/auth/password', passwordChange, testState.tokens.newUser);
  if (passwordResult.success) {
    log.success('✓ Password changed successfully');
  } else {
    log.error('✗ Failed to change password: ' + JSON.stringify(passwordResult.error));
  }
};

const testDatabaseIntegrity = async () => {
  log.section('TESTING DATABASE INTEGRITY');
  
  // Test 1: Health check
  log.info('Testing server health...');
  const healthResult = await makeRequest('GET', '/api/health');
  if (healthResult.success && healthResult.data.database === 'connected') {
    log.success('✓ Server and database are healthy');
  } else {
    log.error('✗ Server or database issues detected');
  }
  
  // Test 2: Categories endpoint
  log.info('Testing categories endpoint...');
  const categoriesResult = await makeRequest('GET', '/api/categories');
  if (categoriesResult.success && categoriesResult.data.data.length > 0) {
    log.success(`✓ Categories loaded: ${categoriesResult.data.data.length} categories`);
  } else {
    log.error('✗ Failed to load categories');
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🧪 COLLEGE CLUBS APP - COMPREHENSIVE API TESTING'.rainbow.bold);
  console.log('================================================'.rainbow);
  
  const startTime = Date.now();
  
  try {
    await testDatabaseIntegrity();
    await testAuthentication();
    await testClubManagement();
    await testMembershipFlow();
    await testDashboardAndStats();
    await testProfileManagement();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log.section('TEST SUMMARY');
    log.success(`All tests completed in ${duration} seconds`);
    
    // Show test state for debugging
    console.log('\n📊 Test State:'.blue.bold);
    console.log('Tokens:', Object.keys(testState.tokens));
    console.log('Club ID:', testState.clubId);
    console.log('Request ID:', testState.requestId);
    console.log('New User ID:', testState.newUserId);
    
  } catch (error) {
    log.error('Test execution failed: ' + error.message);
    console.error(error);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
};

// Run tests
const main = async () => {
  log.info('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log.error('❌ Server is not running! Please start the server first:');
    console.log('   cd backend');
    console.log('   node server-mongodb.js');
    process.exit(1);
  }
  
  log.success('✅ Server is running, starting tests...\n');
  await runAllTests();
};

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log.error('Unhandled promise rejection: ' + error.message);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runAllTests, testState };
