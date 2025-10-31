import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material'
import { Add, Group, Event, Announcement, TrendingUp } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, isClubHead, isSuperAdmin } = useAuth()
  const [myClubs, setMyClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalMembers: 0,
    adminClubs: 0,
    upcomingEvents: 0,
    announcements: 0,
  })

  useEffect(() => {
    fetchMyClubs()
    fetchDashboardStats()
  }, [])

  const fetchMyClubs = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/clubs/user/my-clubs')
      const clubs = response.data.data
      setMyClubs(clubs)
      
      // Calculate stats
      const adminClubs = clubs.filter(club => 
        club.admins.some(admin => admin === user.id)
      ).length
      
      const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0)
      
      setStats(prevStats => ({
        ...prevStats,
        totalClubs: clubs.length,
        totalMembers,
        adminClubs,
      }))
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast.error('Failed to load your clubs')
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      // Fetch upcoming events
      const eventsResponse = await axios.get('/api/events/user/my-events?type=attending&status=upcoming')
      const upcomingEvents = eventsResponse.data.data.length

      // Fetch recent announcements (you can add this endpoint later)
      // For now, we'll use a placeholder
      const announcements = 0

      setStats(prevStats => ({
        ...prevStats,
        upcomingEvents,
        announcements,
      }))
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Don't show error for stats as it's not critical
    }
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here's what's happening with your clubs
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.totalClubs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Joined Clubs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.adminClubs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admin Roles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Event sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {stats.upcomingEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Announcement sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {stats.announcements}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Announcements
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* My Clubs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                My Clubs
              </Typography>
              <Button
                component={RouterLink}
                to="/clubs"
                variant="outlined"
                startIcon={<Add />}
              >
                Find More Clubs
              </Button>
            </Box>

            {myClubs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Group sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't joined any clubs yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Discover clubs that match your interests and start connecting with fellow students.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/clubs"
                  variant="outlined"
                  size="large"
                >
                  Explore Clubs
                </Button>
              </Box>
            ) : (
              <List>
                {myClubs.map((club, index) => (
                  <React.Fragment key={club._id}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                        <Avatar
                          src={club.logo}
                          className={club.logo ? 'retain-color' : ''}
                          sx={{
                            width: 50,
                            height: 50,
                            mr: 2,
                            bgcolor: club.category?.color || 'primary.main',
                          }}
                        >
                          {club.category?.icon || club.name.charAt(0)}
                        </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {club.name}
                            </Typography>
                            {club.admins.includes(user?.id) && (
                              <Chip label="Admin" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {club.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Chip
                                label={club.category?.name}
                                size="small"
                                sx={{
                                  bgcolor: club.category?.color + '20',
                                  color: club.category?.color,
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {club.memberCount} members
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Button
                        component={RouterLink}
                        to={`/clubs/${club._id}`}
                        variant="outlined"
                        size="small"
                      >
                        View
                      </Button>
                    </ListItem>
                    {index < myClubs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              Quick Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isSuperAdmin() && (
                <Button
                  component={RouterLink}
                  to="/create-club"
                  variant="outlined"
                  fullWidth
                  startIcon={<Add />}
                  sx={{ py: 1.5 }}
                >
                  Create New Club
                </Button>
              )}
              
              {isSuperAdmin() && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<TrendingUp />}
                  sx={{ py: 1.5 }}
                >
                  Admin Dashboard
                </Button>
              )}
              
              <Button
                component={RouterLink}
                to="/clubs"
                variant="outlined"
                fullWidth
                startIcon={<Group />}
                sx={{ py: 1.5 }}
              >
                Browse All Clubs
              </Button>
              
              <Button
                component={RouterLink}
                to="/events"
                variant="outlined"
                fullWidth
                startIcon={<Event />}
                sx={{ py: 1.5 }}
              >
                View Events
              </Button>
              
              <Button
                component={RouterLink}
                to="/profile"
                variant="outlined"
                fullWidth
                startIcon={<TrendingUp />}
                sx={{ py: 1.5 }}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>

          {/* User Info */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Your Profile
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={user?.profilePicture}
                sx={{ width: 60, height: 60, mr: 2 }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.year} • {user?.major}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Chip 
                  label={user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'club_head' ? 'Club Head' : 'Student'} 
                  size="small" 
                  color={user?.role === 'super_admin' ? 'error' : user?.role === 'club_head' ? 'primary' : 'default'}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard
