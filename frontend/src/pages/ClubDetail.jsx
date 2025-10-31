import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Collapse,
  IconButton,
} from '@mui/material'
import { 
  Group, 
  Person, 
  Email, 
  Schedule, 
  Info, 
  Add, 
  ExpandMore,
  ExpandLess,
  Settings,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  CalendarToday,
  LocationOn
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import ClubManagement from '../components/ClubManagement'

const ClubDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  const [club, setClub] = useState(null)
  const [userStatus, setUserStatus] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showManagement, setShowManagement] = useState(false)
  const [showAnnouncements, setShowAnnouncements] = useState(true)
  const [showEvents, setShowEvents] = useState(true)

  useEffect(() => {
    fetchClub()
  }, [id])

  useEffect(() => {
    if (club) {
      fetchAnnouncements()
      fetchEvents()
      if (isAuthenticated) {
        fetchMembershipStatus()
      }
    }
  }, [id, club, isAuthenticated])

  const fetchClub = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/clubs/${id}`)
      setClub(response.data.data)
      setError('')
    } catch (error) {
      console.error('Error fetching club:', error)
      if (error.response?.status === 404) {
        setError('Club not found')
      } else {
        setError('Failed to load club details')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      // Only fetch if user is authenticated
      if (!isAuthenticated) {
        setAnnouncements([]);
        return;
      }
      
      const response = await axios.get(`/api/clubs/${id}/announcements`)
      setAnnouncements(response.data.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      if (error.response?.status === 403) {
        setAnnouncements([]);
      }
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`/api/events/club/${id}?status=upcoming&limit=5`)
      setEvents(response.data.data)
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    }
  }

  const fetchMembershipStatus = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}/membership-status`)
      setUserStatus(response.data.data)
    } catch (error) {
      console.error('Error fetching membership status:', error)
      setUserStatus(null)
    }
  }

  const handleJoinClub = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join clubs')
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`/api/clubs/${id}/join`, { message: joinMessage })
      
      if (response.data.requiresApproval) {
        toast.success('Membership request submitted successfully! Please wait for approval.')
      } else {
        toast.success('Successfully joined the club!')
      }
      
      setJoinDialogOpen(false)
      setJoinMessage('')
      // Refresh club data and membership status
      await fetchClub()
      await fetchMembershipStatus()
    } catch (error) {
      console.error('Error joining club:', error)
      const message = error.response?.data?.message || 'Failed to submit membership request'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLeaveClub = async () => {
    if (!isAuthenticated) {
      return
    }

    if (window.confirm('Are you sure you want to leave this club?')) {
      try {
        await axios.delete(`/api/clubs/${id}/leave`)
        toast.success('Successfully left the club')
        // Refresh club data and membership status
        await fetchClub()
        await fetchMembershipStatus()
      } catch (error) {
        console.error('Error leaving club:', error)
        const message = error.response?.data?.message || 'Failed to leave club'
        toast.error(message)
      }
    }
  }

  const handleDeleteClub = async () => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      return
    }

    if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/clubs/${id}`)
        toast.success('Club deleted successfully')
        navigate('/clubs')
      } catch (error) {
        console.error('Error deleting club:', error)
        const message = error.response?.data?.message || 'Failed to delete club'
        toast.error(message)
      }
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!club) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Club not found
        </Alert>
      </Container>
    )
  }

  const canJoin = isAuthenticated && !userStatus?.isMember && !userStatus?.hasPendingRequest && club.allowJoining && userStatus?.canApply
  const isPending = userStatus?.hasPendingRequest
  const isMember = userStatus?.isMember
  const isClubHead = (isAuthenticated && club.clubHead && 
    (club.clubHead._id === user?.id || club.clubHead._id === user?._id))
  const isSuperAdmin = user?.role === 'super_admin'
  const canManageClub = isClubHead || isSuperAdmin

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={club.logo}
                  className={club.logo ? 'retain-color' : ''}
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    bgcolor: club.category?.color || 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {club.category?.icon || club.name.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {club.name}
                  </Typography>
                  <Chip
                    label={club.category?.name}
                    sx={{
                      bgcolor: club.category?.color + '20',
                      color: club.category?.color,
                      fontWeight: 'medium',
                      mb: 1,
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Group fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {club.memberCount} members
                      </Typography>
                    </Box>
                    {club.maxMembers && (
                      <Typography variant="body2" color="text.secondary">
                        (Max: {club.maxMembers})
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {club.description}
              </Typography>

              {club.requirements && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {club.requirements}
                  </Typography>
                </>
              )}

              {club.meetingSchedule && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Schedule color="action" />
                  <Typography variant="body1">
                    <strong>Meeting Schedule:</strong> {club.meetingSchedule}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Email color="action" />
                <Typography variant="body1">
                  <strong>Contact:</strong> {club.contactEmail}
                </Typography>
              </Box>

              {club.tags && club.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {club.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {canJoin && (
              <Button
                  variant=" "
                  startIcon={<Add />}
                  onClick={() => setJoinDialogOpen(true)}
                  size="large"
                  sx={{ border: '1px solid #000' }}
                >
                  Join Club
                </Button>
            )}
            {isPending && (
              <Button variant="outlined" disabled size="large">
                Request Pending
              </Button>
            )}
            {isAuthenticated && !userStatus?.isMember && !userStatus?.hasPendingRequest && !club.allowJoining && (
              <Button variant="outlined" disabled size="large">
                Joining Disabled
              </Button>
            )}
            {isMember && !canManageClub && (
              <Button variant="outlined" color="error" onClick={handleLeaveClub} size="large">
                Leave Club
              </Button>
            )}
            {canManageClub && (
              <Button 
                variant="outlined" 
                color="secondary" 
                size="large"
                startIcon={<Settings />}
                onClick={() => setShowManagement(!showManagement)}
              >
                {showManagement ? 'Hide Management' : 'Manage Club'}
              </Button>
            )}
            {isSuperAdmin && (
              <Button 
                variant="contained" 
                color="error" 
                size="large"
                onClick={handleDeleteClub}
              >
                Delete Club
              </Button>
            )}
            {!isAuthenticated && (
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                size="large"
              >
                Login to Join
              </Button>
            )}
          </Box>

          {/* Club Management Interface (Club Head or Super Admin) */}
          {canManageClub && showManagement && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Club Management
                </Typography>
                <ClubManagement club={club} onUpdate={fetchClub} />
              </CardContent>
            </Card>
          )}

          {/* Announcements Section - For members, club heads, and super admins */}
          {(isMember || isClubHead || isSuperAdmin) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AnnouncementIcon />
                    Announcements ({announcements.length})
                  </Typography>
                  <IconButton onClick={() => setShowAnnouncements(!showAnnouncements)}>
                    {showAnnouncements ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                <Collapse in={showAnnouncements}>
                  {announcements.length === 0 ? (
                    <Alert severity="info">No announcements yet.</Alert>
                  ) : (
                    <List>
                      {announcements.map((announcement, index) => (
                        <React.Fragment key={announcement._id}>
                          <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {announcement.title}
                              </Typography>
                              <Chip 
                                label="ANNOUNCEMENT" 
                                color="primary"
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                              {announcement.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Posted by {announcement.author?.firstName} {announcement.author?.lastName} on {formatDate(announcement.createdAt)}
                              {announcement.expiresAt && ` • Expires: ${formatDate(announcement.expiresAt)}`}
                            </Typography>
                          </ListItem>
                          {index < announcements.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          )}

          {/* Events Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon />
                  Upcoming Events ({events.length})
                </Typography>
                <IconButton onClick={() => setShowEvents(!showEvents)}>
                  {showEvents ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={showEvents}>
                {events.length === 0 ? (
                  <Alert severity="info">No upcoming events scheduled.</Alert>
                ) : (
                  <List>
                    {events.map((event, index) => (
                      <React.Fragment key={event._id}>
                        <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {event.title}
                            </Typography>
                            <Chip 
                              label={event.status.toUpperCase()} 
                              color="primary"
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                            {event.description}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(event.dateTime).toLocaleDateString()} at {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {event.location}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {event.attendees?.length || 0} attending
                              {event.maxAttendees && ` (max ${event.maxAttendees})`}
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < events.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
                {events.length > 0 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      component="a"
                      href="/events"
                    >
                      View All Events
                    </Button>
                  </Box>
                )}
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Club Head */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Club Head
              </Typography>
              {club.clubHead && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={club.clubHead.profilePicture} sx={{ bgcolor: 'primary.main' }}>
                      {club.clubHead.firstName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${club.clubHead.firstName} ${club.clubHead.lastName}`}
                    secondary={club.clubHead.email}
                  />
                </ListItem>
              )}
            </CardContent>
          </Card>

          {/* Club Members */}
          {club.members && club.members.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group />
                  Club Members ({club.members.length})
                </Typography>
                <List dense>
                  {club.members.slice(0, 10).map((member) => (
                    <ListItem key={member._id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={member.profilePicture} sx={{ bgcolor: 'secondary.main' }}>
                          {member.firstName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${member.firstName} ${member.lastName}`}
                        secondary={`${member.year} • ${member.major}`}
                      />
                    </ListItem>
                  ))}
                </List>
                {club.members.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    And {club.members.length - 10} more members...
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Join Club Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join {club.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tell the club admins why you want to join and what you can contribute.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message to Admins (Optional)"
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="I'm interested in joining because..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleJoinClub}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ClubDetail
