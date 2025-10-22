import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const TestPage = () => {
  const { user, login, logout } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [testLogs, setTestLogs] = useState([]);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [originalUser, setOriginalUser] = useState(null); // Store original user

  // Check if user is super admin
  if (!user || user.role !== 'super_admin') {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            🔒 Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The testing suite is only available to Super Administrators.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Store the original user at component mount
  useEffect(() => {
    if (user && !originalUser) {
      setOriginalUser(user);
    }
  }, [user, originalUser]);

  // Test credentials
  const testCredentials = {
    admin: { email: 'admin@college.edu', password: 'admin123' },
    clubHead: { email: 'jane@college.edu', password: 'password123' },
    student: { email: 'alice@college.edu', password: 'password123' }
  };

  // Create a separate test token for API calls (not affecting main session)
  const [testToken, setTestToken] = useState(null);

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
        setTestToken(data.token);
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
  const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const testSuccess = (testName) => {
    setTestResults(prev => ({ ...prev, [testName]: 'success' }));
    log(`✅ ${testName} - PASSED`, 'success');
  };

  const testFailed = (testName, error) => {
    setTestResults(prev => ({ ...prev, [testName]: 'error' }));
    log(`❌ ${testName} - FAILED: ${error}`, 'error');
  };

  const clearResults = () => {
    setTestResults({});
    setTestLogs([]);
  };

  // Test suite definitions
  const testSuites = [
    {
      id: 'authentication',
      name: 'Authentication Tests',
      icon: <SecurityIcon />,
      tests: [
        'login-admin',
        'login-club-head',
        'login-student',
        'login-wrong-credentials',
        'logout',
        'protected-route-access',
        'token-persistence'
      ]
    },
    {
      id: 'dashboard',
      name: 'Dashboard Tests',
      icon: <DashboardIcon />,
      tests: [
        'dashboard-load',
        'stats-display',
        'user-clubs-display',
        'recent-activities',
        'dashboard-without-auth'
      ]
    },
    {
      id: 'clubs',
      name: 'Club Management Tests',
      icon: <GroupIcon />,
      tests: [
        'clubs-list-load',
        'club-details-view',
        'club-search',
        'club-filter',
        'clubs-without-auth',
        'join-club-flow',
        'membership-status-check'
      ]
    },
    {
      id: 'profile',
      name: 'Profile Tests',
      icon: <PersonIcon />,
      tests: [
        'profile-view',
        'profile-update',
        'password-change',
        'profile-validation',
        'profile-without-auth'
      ]
    },
    {
      id: 'events',
      name: 'Events Tests',
      icon: <EventIcon />,
      tests: [
        'events-load',
        'events-filter',
        'user-events',
        'events-without-auth'
      ]
    }
  ];

  // Individual test functions
  const runTest = async (testName) => {
    try {
      switch (testName) {
        // Authentication Tests
        case 'login-admin':
          await login(testCredentials.admin.email, testCredentials.admin.password);
          if (user?.role === 'super_admin') {
            testSuccess('Admin Login');
          } else {
            testFailed('Admin Login', 'Login failed or wrong role');
          }
          break;

        case 'login-club-head':
          await login(testCredentials.clubHead.email, testCredentials.clubHead.password);
          if (user?.role === 'club_head') {
            testSuccess('Club Head Login');
          } else {
            testFailed('Club Head Login', 'Login failed or wrong role');
          }
          break;

        case 'login-student':
          await login(testCredentials.student.email, testCredentials.student.password);
          if (user?.role === 'student') {
            testSuccess('Student Login');
          } else {
            testFailed('Student Login', 'Login failed or wrong role');
          }
          break;

        case 'login-wrong-credentials':
          try {
            await login('wrong@email.com', 'wrongpassword');
            testFailed('Wrong Credentials Test', 'Should have failed but succeeded');
          } catch (error) {
            testSuccess('Wrong Credentials Test');
          }
          break;

        case 'logout':
          logout();
          if (!user) {
            testSuccess('Logout Test');
          } else {
            testFailed('Logout Test', 'User still logged in');
          }
          break;

        case 'protected-route-access':
          // Re-login for protected route test
          await login(testCredentials.student.email, testCredentials.student.password);
          const response = await API.get('/auth/me');
          if (response.data.success) {
            testSuccess('Protected Route Access');
          } else {
            testFailed('Protected Route Access', 'Could not access protected route');
          }
          break;

        // Dashboard Tests
        case 'dashboard-load':
          const dashboardData = await API.get('/dashboard/stats');
          if (dashboardData.data.success) {
            testSuccess('Dashboard Load');
          } else {
            testFailed('Dashboard Load', 'Failed to load dashboard');
          }
          break;

        case 'dashboard-without-auth':
          logout();
          try {
            await API.get('/dashboard/stats');
            testFailed('Dashboard Without Auth', 'Should require authentication');
          } catch (error) {
            if (error.response?.status === 401) {
              testSuccess('Dashboard Without Auth');
            } else {
              testFailed('Dashboard Without Auth', 'Wrong error type');
            }
          }
          // Re-login for other tests
          await login(testCredentials.student.email, testCredentials.student.password);
          break;

        // Club Tests
        case 'clubs-list-load':
          const clubsData = await API.get('/clubs');
          if (clubsData.data.success && Array.isArray(clubsData.data.data)) {
            testSuccess('Clubs List Load');
          } else {
            testFailed('Clubs List Load', 'Failed to load clubs');
          }
          break;

        case 'club-details-view':
          const clubs = await API.get('/clubs');
          if (clubs.data.data.length > 0) {
            const firstClub = clubs.data.data[0];
            const clubDetails = await API.get(`/clubs/${firstClub._id}`);
            if (clubDetails.data.success) {
              testSuccess('Club Details View');
            } else {
              testFailed('Club Details View', 'Failed to load club details');
            }
          } else {
            testFailed('Club Details View', 'No clubs available');
          }
          break;

        case 'clubs-without-auth':
          logout();
          try {
            await API.get('/clubs');
            testFailed('Clubs Without Auth', 'Should require authentication');
          } catch (error) {
            if (error.response?.status === 401) {
              testSuccess('Clubs Without Auth');
            } else {
              testFailed('Clubs Without Auth', 'Wrong error type');
            }
          }
          // Re-login for other tests
          await login(testCredentials.student.email, testCredentials.student.password);
          break;

        // Profile Tests
        case 'profile-view':
          const profileData = await API.get('/auth/me');
          if (profileData.data.success && profileData.data.data) {
            testSuccess('Profile View');
          } else {
            testFailed('Profile View', 'Failed to load profile');
          }
          break;

        case 'profile-without-auth':
          logout();
          try {
            await API.get('/auth/me');
            testFailed('Profile Without Auth', 'Should require authentication');
          } catch (error) {
            if (error.response?.status === 401) {
              testSuccess('Profile Without Auth');
            } else {
              testFailed('Profile Without Auth', 'Wrong error type');
            }
          }
          // Re-login for other tests
          await login(testCredentials.student.email, testCredentials.student.password);
          break;

        // Events Tests
        case 'events-load':
          const eventsData = await API.get('/events/user/my-events');
          if (eventsData.data.success) {
            testSuccess('Events Load');
          } else {
            testFailed('Events Load', 'Failed to load events');
          }
          break;

        case 'events-without-auth':
          logout();
          try {
            await API.get('/events/user/my-events');
            testFailed('Events Without Auth', 'Should require authentication');
          } catch (error) {
            if (error.response?.status === 401) {
              testSuccess('Events Without Auth');
            } else {
              testFailed('Events Without Auth', 'Wrong error type');
            }
          }
          // Re-login for other tests
          await login(testCredentials.student.email, testCredentials.student.password);
          break;

        default:
          testFailed(testName, 'Test not implemented');
      }
    } catch (error) {
      testFailed(testName, error.message || 'Unknown error');
    }
  };

  // Run all tests in a suite
  const runTestSuite = async (suiteId) => {
    setIsRunning(true);
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    log(`🔷 Starting ${suite.name}`, 'info');
    
    for (const testName of suite.tests) {
      await runTest(testName);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    log(`✅ Completed ${suite.name}`, 'success');
    setIsRunning(false);
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    log('🧪 Starting comprehensive frontend tests', 'info');

    for (const suite of testSuites) {
      await runTestSuite(suite.id);
    }

    log('🎉 All tests completed!', 'success');
    setIsRunning(false);
  };

  // Get test result icon
  const getTestIcon = (testName) => {
    const result = testResults[testName];
    if (result === 'success') return <CheckCircleIcon sx={{ color: 'green' }} />;
    if (result === 'error') return <ErrorIcon sx={{ color: 'red' }} />;
    return <CircularProgress size={20} />;
  };

  // Calculate suite status
  const getSuiteStatus = (suite) => {
    const results = suite.tests.map(test => testResults[test]);
    if (results.every(r => r === 'success')) return 'success';
    if (results.some(r => r === 'error')) return 'error';
    if (results.some(r => r !== undefined)) return 'running';
    return 'pending';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          🧪 Frontend Testing Suite
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Comprehensive testing system to verify all frontend functionality and prevent regressions.
          This suite tests authentication, dashboard, clubs, profile, and events features.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={runAllTests}
            disabled={isRunning}
            size="large"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </Box>

        {/* Current User Status */}
        <Alert severity={user ? "success" : "info"} sx={{ mb: 2 }}>
          {user ? (
            <>Logged in as: <strong>{user.firstName} {user.lastName}</strong> ({user.role})</>
          ) : (
            "Not logged in - tests will handle authentication"
          )}
        </Alert>
      </Paper>

      {/* Test Suites */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {testSuites.map((suite) => {
            const status = getSuiteStatus(suite);
            return (
              <Accordion key={suite.id} sx={{ mb: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: 
                      status === 'success' ? 'success.light' :
                      status === 'error' ? 'error.light' :
                      status === 'running' ? 'warning.light' :
                      'grey.100'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {suite.icon}
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {suite.name}
                    </Typography>
                    <Chip
                      label={
                        status === 'success' ? 'All Passed' :
                        status === 'error' ? 'Some Failed' :
                        status === 'running' ? 'Running...' :
                        'Pending'
                      }
                      color={
                        status === 'success' ? 'success' :
                        status === 'error' ? 'error' :
                        status === 'running' ? 'warning' :
                        'default'
                      }
                      size="small"
                    />
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
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {suite.tests.map((testName) => (
                      <ListItem key={testName}>
                        <ListItemIcon>
                          {getTestIcon(testName)}
                        </ListItemIcon>
                        <ListItemText
                          primary={testName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          secondary={
                            testResults[testName] === 'success' ? 'Passed' :
                            testResults[testName] === 'error' ? 'Failed' :
                            'Pending'
                          }
                        />
                        <Button
                          size="small"
                          onClick={() => runTest(testName)}
                          disabled={isRunning}
                        >
                          Run
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Grid>

        {/* Test Logs Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '600px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              📝 Test Logs
            </Typography>
            {testLogs.length === 0 ? (
              <Typography color="text.secondary">
                No logs yet. Run tests to see results here.
              </Typography>
            ) : (
              <List dense>
                {testLogs.map((log, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={log.message}
                      secondary={log.timestamp}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.85rem',
                          color: log.type === 'error' ? 'error.main' : 
                                log.type === 'success' ? 'success.main' : 'text.primary'
                        },
                        '& .MuiListItemText-secondary': {
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Test Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="success.main" variant="h4">
                  {Object.values(testResults).filter(r => r === 'success').length}
                </Typography>
                <Typography variant="body2">Passed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="error.main" variant="h4">
                  {Object.values(testResults).filter(r => r === 'error').length}
                </Typography>
                <Typography variant="body2">Failed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="primary.main" variant="h4">
                  {Object.keys(testResults).length}
                </Typography>
                <Typography variant="body2">Total Run</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="h4">
                  {testSuites.reduce((acc, suite) => acc + suite.tests.length, 0)}
                </Typography>
                <Typography variant="body2">Available</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TestPage;
