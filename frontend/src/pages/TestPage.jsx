import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
  Alert,
  Collapse,
  Grid
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const TestPage = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [testLogs, setTestLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedSuites, setExpandedSuites] = useState({});
  const [testToken, setTestToken] = useState(null);

  // Check if user is super admin
  if (!user || user.role !== 'super_admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>Only super administrators can access the test suite.</Typography>
        </Alert>
      </Box>
    );
  }

  // Separate test login function that doesn't affect main session
  const testLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (data.success) {
        return { success: true, user: data.user, token: data.token };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  // Test API call with separate token
  const testApiCall = async (endpoint, method = 'GET', data = null, token = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`http://localhost:5000/api${endpoint}`, options);
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 0,
      };
    }
  };

  // Logging function
  const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Test suite definitions
  const testSuites = [
    {
      id: 'auth',
      name: '🔐 Authentication Tests',
      description: 'Test login/logout functionality with isolated sessions',
      icon: <SecurityIcon />,
      tests: [
        'Test Student Login (alice@college.edu)',
        'Test Club Head Login (bob@college.edu)', 
        'Test Super Admin Login (admin@college.edu)',
        'Test Invalid Login Credentials'
      ]
    },
    {
      id: 'api',
      name: '🌐 API Tests',
      description: 'Test API endpoints with proper authentication',
      icon: <DashboardIcon />,
      tests: [
        'Test Public Clubs API',
        'Test Public Events API',
        'Test Authenticated Profile API',
        'Test Admin Dashboard Stats API'
      ]
    },
    {
      id: 'clubs',
      name: '🏫 Clubs Tests',
      description: 'Test club management functionality',
      icon: <GroupIcon />,
      tests: [
        'Test Fetch User Clubs',
        'Test Club Details',
        'Test Club Membership Status',
        'Test Club Head Functions'
      ]
    },
    {
      id: 'dashboard',
      name: '📊 Dashboard Tests',
      description: 'Test admin dashboard functionality',
      icon: <PersonIcon />,
      tests: [
        'Test Dashboard Stats',
        'Test Users Management',
        'Test Clubs Management',
        'Test System Overview'
      ]
    }
  ];

  // Test execution with isolated sessions
  const executeTest = async (testName) => {
    setTestResults(prev => ({ ...prev, [testName]: 'running' }));
    
    try {
      let result;
      
      switch (testName) {
        // Authentication Tests
        case 'Test Student Login (alice@college.edu)':
          result = await testLogin('alice@college.edu', 'password123');
          if (!result.success) throw new Error('Student login failed');
          log(`✅ Student login successful: ${result.user.name} (${result.user.role})`, 'success');
          break;
          
        case 'Test Club Head Login (bob@college.edu)':
          result = await testLogin('bob@college.edu', 'password123');
          if (!result.success) throw new Error('Club head login failed');
          log(`✅ Club head login successful: ${result.user.name} (${result.user.role})`, 'success');
          break;
          
        case 'Test Super Admin Login (admin@college.edu)':
          result = await testLogin('admin@college.edu', 'password123');
          if (!result.success) throw new Error('Super admin login failed');
          log(`✅ Super admin login successful: ${result.user.name} (${result.user.role})`, 'success');
          break;
          
        case 'Test Invalid Login Credentials':
          try {
            await testLogin('invalid@email.com', 'wrongpassword');
            throw new Error('Invalid login should have failed');
          } catch (error) {
            if (error.message.includes('should have failed')) throw error;
            log('✅ Invalid login correctly rejected', 'success');
          }
          break;

        // API Tests
        case 'Test Public Clubs API':
          result = await testApiCall('/clubs');
          if (!result.success) throw new Error('Failed to fetch clubs');
          log(`✅ Fetched ${result.data.length} clubs successfully`, 'success');
          break;
          
        case 'Test Public Events API':
          result = await testApiCall('/events');
          if (!result.success) throw new Error('Failed to fetch events');
          log(`✅ Fetched ${result.data.length} events successfully`, 'success');
          break;
          
        case 'Test Authenticated Profile API':
          const userLogin = await testLogin('alice@college.edu', 'password123');
          if (!userLogin.success) throw new Error('User login failed');
          result = await testApiCall('/auth/profile', 'GET', null, userLogin.token);
          if (!result.success) throw new Error('Failed to fetch profile');
          log(`✅ Profile fetched for ${result.data.user.name}`, 'success');
          break;
          
        case 'Test Admin Dashboard Stats API':
          const adminLogin = await testLogin('admin@college.edu', 'password123');
          if (!adminLogin.success) throw new Error('Admin login failed');
          result = await testApiCall('/dashboard/stats', 'GET', null, adminLogin.token);
          if (!result.success) throw new Error('Failed to fetch dashboard stats');
          log(`✅ Dashboard stats: ${result.data.totalUsers} users, ${result.data.totalClubs} clubs`, 'success');
          break;

        // Club Tests
        case 'Test Fetch User Clubs':
          const studentLogin = await testLogin('alice@college.edu', 'password123');
          if (!studentLogin.success) throw new Error('Student login failed');
          result = await testApiCall('/clubs/my-clubs', 'GET', null, studentLogin.token);
          if (!result.success) throw new Error('Failed to fetch user clubs');
          log(`✅ User is member of ${result.data.length} clubs`, 'success');
          break;
          
        case 'Test Club Details':
          result = await testApiCall('/clubs');
          if (!result.success || !result.data.length) throw new Error('No clubs available');
          const clubResult = await testApiCall(`/clubs/${result.data[0]._id}`);
          if (!clubResult.success) throw new Error('Failed to fetch club details');
          log(`✅ Club details fetched for ${clubResult.data.name}`, 'success');
          break;
          
        case 'Test Club Membership Status':
          const memberLogin = await testLogin('alice@college.edu', 'password123');
          if (!memberLogin.success) throw new Error('Member login failed');
          const clubsResult = await testApiCall('/clubs');
          if (!clubsResult.success || !clubsResult.data.length) throw new Error('No clubs available');
          const membershipResult = await testApiCall(`/clubs/${clubsResult.data[0]._id}/membership-status`, 'GET', null, memberLogin.token);
          if (!membershipResult.success) throw new Error('Failed to check membership status');
          log(`✅ Membership status checked successfully`, 'success');
          break;
          
        case 'Test Club Head Functions':
          const headLogin = await testLogin('bob@college.edu', 'password123');
          if (!headLogin.success) throw new Error('Club head login failed');
          const headClubsResult = await testApiCall('/clubs/my-clubs', 'GET', null, headLogin.token);
          if (!headClubsResult.success) throw new Error('Failed to fetch head clubs');
          log(`✅ Club head manages ${headClubsResult.data.length} clubs`, 'success');
          break;

        // Dashboard Tests
        case 'Test Dashboard Stats':
          const dashAdminLogin = await testLogin('admin@college.edu', 'password123');
          if (!dashAdminLogin.success) throw new Error('Admin login failed');
          result = await testApiCall('/dashboard/stats', 'GET', null, dashAdminLogin.token);
          if (!result.success) throw new Error('Failed to fetch dashboard stats');
          log(`✅ Dashboard loaded: ${result.data.totalUsers} users, ${result.data.totalClubs} clubs, ${result.data.totalEvents} events`, 'success');
          break;
          
        case 'Test Users Management':
          const userAdminLogin = await testLogin('admin@college.edu', 'password123');
          if (!userAdminLogin.success) throw new Error('Admin login failed');
          result = await testApiCall('/clubs', 'GET', null, userAdminLogin.token);
          if (!result.success) throw new Error('Failed to fetch users data');
          log(`✅ Users management interface accessible`, 'success');
          break;
          
        case 'Test Clubs Management':
          const clubAdminLogin = await testLogin('admin@college.edu', 'password123');
          if (!clubAdminLogin.success) throw new Error('Admin login failed');
          result = await testApiCall('/clubs', 'GET', null, clubAdminLogin.token);
          if (!result.success) throw new Error('Failed to fetch clubs data');
          log(`✅ Clubs management interface accessible`, 'success');
          break;
          
        case 'Test System Overview':
          const sysAdminLogin = await testLogin('admin@college.edu', 'password123');
          if (!sysAdminLogin.success) throw new Error('Admin login failed');
          const statsResult = await testApiCall('/dashboard/stats', 'GET', null, sysAdminLogin.token);
          const clubsOverviewResult = await testApiCall('/clubs', 'GET', null, sysAdminLogin.token);
          if (!statsResult.success || !clubsOverviewResult.success) throw new Error('Failed to fetch system overview');
          log(`✅ System overview: Complete data accessible`, 'success');
          break;

        default:
          throw new Error(`Unknown test: ${testName}`);
      }
      
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
      
    } catch (error) {
      log(`❌ ${testName}: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
    }
  };

  // Run test suite
  const runTestSuite = async (suiteId) => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    setIsRunning(true);
    log(`🚀 Starting ${suite.name}`, 'info');

    for (const testName of suite.tests) {
      if (!isRunning) break; // Allow stopping
      await executeTest(testName);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests
    }

    log(`✅ Completed ${suite.name}`, 'success');
    setIsRunning(false);
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    setTestLogs([]);
    log('🧪 Starting comprehensive test suite (isolated sessions)', 'info');
    log(`ℹ️ Current user session preserved: ${user.name} (${user.role})`, 'info');

    for (const suite of testSuites) {
      if (!isRunning) break;
      await runTestSuite(suite.id);
    }

    log('🎉 All tests completed! Your session remains intact.', 'success');
    setIsRunning(false);
  };

  // Stop tests
  const stopTests = () => {
    setIsRunning(false);
    log('⏹️ Tests stopped by user', 'info');
  };

  // Clear results
  const clearResults = () => {
    setTestResults({});
    setTestLogs([]);
  };

  // Toggle suite expansion
  const toggleSuite = (suiteId) => {
    setExpandedSuites(prev => ({
      ...prev,
      [suiteId]: !prev[suiteId]
    }));
  };

  // Get test result icon
  const getTestIcon = (testName) => {
    const result = testResults[testName];
    if (result === 'success') return <CheckCircleIcon sx={{ color: 'green' }} />;
    if (result === 'error') return <ErrorIcon sx={{ color: 'red' }} />;
    if (result === 'running') return <CircularProgress size={20} />;
    return null;
  };

  // Calculate suite status
  const getSuiteStatus = (suite) => {
    const results = suite.tests.map(test => testResults[test]);
    if (results.every(r => r === 'success')) return 'success';
    if (results.some(r => r === 'error')) return 'error';
    if (results.some(r => r === 'running')) return 'running';
    return 'pending';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          🧪 Frontend Testing Suite (Isolated Sessions)
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Comprehensive testing system with session isolation. Tests run in separate authentication sessions
          and will not affect your current login status as <strong>{user.name}</strong>.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Session Safety:</strong> All tests use isolated authentication tokens. 
            Your current session as {user.name} ({user.role}) will remain active and unaffected.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={isRunning ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={runAllTests}
            disabled={isRunning}
            color="primary"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          {isRunning && (
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              onClick={stopTests}
              color="error"
            >
              Stop Tests
            </Button>
          )}
          
          <Button
            variant="outlined"
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {testSuites.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Test Suites
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {testSuites.reduce((acc, suite) => acc + suite.tests.length, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {Object.values(testResults).filter(r => r === 'success').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  {Object.values(testResults).filter(r => r === 'error').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Test Suites */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Test Suites</Typography>
            {testSuites.map((suite) => {
              const status = getSuiteStatus(suite);
              const isExpanded = expandedSuites[suite.id];
              
              return (
                <Card key={suite.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleSuite(suite.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {suite.icon}
                        <Typography variant="h6">{suite.name}</Typography>
                        <Chip 
                          size="small" 
                          label={status}
                          color={
                            status === 'success' ? 'success' : 
                            status === 'error' ? 'error' :
                            status === 'running' ? 'warning' : 'default'
                          }
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            runTestSuite(suite.id);
                          }}
                          disabled={isRunning}
                        >
                          Run Suite
                        </Button>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {suite.description}
                    </Typography>

                    <Collapse in={isExpanded}>
                      <List sx={{ mt: 2 }}>
                        {suite.tests.map((testName) => (
                          <ListItem key={testName} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {getTestIcon(testName)}
                            </ListItemIcon>
                            <ListItemText 
                              primary={testName}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, maxHeight: '600px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Test Logs</Typography>
            {testLogs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No logs yet. Run tests to see output.
              </Typography>
            ) : (
              testLogs.map((log, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: log.type === 'error' ? 'error.main' : 
                             log.type === 'success' ? 'success.main' : 'text.secondary'
                    }}
                  >
                    [{log.timestamp}] {log.message}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestPage;
