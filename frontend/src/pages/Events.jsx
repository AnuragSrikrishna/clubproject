import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as JoinIcon,
  PersonRemove as LeaveIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import EventCreateDialog from '../components/EventCreateDialog';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);

  const canCreateEvent = user?.role === 'super_admin' || user?.role === 'club_head';

  useEffect(() => {
    fetchEvents();
  }, [tabValue, statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = '/api/events';
      
      if (tabValue === 1) {
        // My Events tab
        url = '/api/events/user/my-events?type=attending';
      } else if (tabValue === 2) {
        // Organizing tab
        url = '/api/events/user/my-events?type=organizing';
      }

      if (tabValue === 0 && statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      setError('Failed to load events. Please try again later.');
      console.error('Error fetching events:', error);
      // Set demo data if backend is not available
      if (error.message.includes('fetch')) {
        setEvents([
          {
            _id: 'demo1',
            title: 'JavaScript Workshop (Demo)',
            description: 'Learn modern JavaScript concepts and best practices.',
            clubId: { name: 'Programming Club', _id: 'club1' },
            organizer: { firstName: 'John', lastName: 'Doe', _id: 'user1' },
            dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            location: 'Computer Lab A',
            status: 'upcoming',
            attendees: [],
            maxAttendees: 30
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchEvents();
      } else {
        const error = await response.json();
        setError(error.message);
      }
    } catch (error) {
      setError('Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchEvents();
      } else {
        const error = await response.json();
        setError(error.message);
      }
    } catch (error) {
      setError('Failed to leave event');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.clubId.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EventCard = ({ event }) => {
    const isUserAttending = event.attendees?.some(attendee => attendee._id === user?._id);
    const canEdit = user && (
      user.role === 'super_admin' || 
      event.organizer._id === user._id
    );

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h3" gutterBottom>
              {event.title}
            </Typography>
            <Chip
              label={getStatusLabel(event.status)}
              color={getStatusColor(event.status)}
              size="small"
            />
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
              {event.clubId.name.charAt(0)}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {event.clubId.name}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(event.dateTime).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} at {new Date(event.dateTime).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {event.location}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <GroupIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {event.attendees?.length || 0} attending
              {event.maxAttendees && ` (max ${event.maxAttendees})`}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {event.description}
          </Typography>
        </CardContent>

        <CardActions>
          <Button
            size="small"
            onClick={() => {
              setSelectedEvent(event);
              setEventDetailsOpen(true);
            }}
          >
            View Details
          </Button>

          {event.status === 'upcoming' && (
            <>
              {isUserAttending ? (
                <Button
                  size="small"
                  startIcon={<LeaveIcon />}
                  onClick={() => handleLeaveEvent(event._id)}
                  color="error"
                >
                  Leave
                </Button>
              ) : (
                <Button
                  size="small"
                  startIcon={<JoinIcon />}
                  onClick={() => handleJoinEvent(event._id)}
                  color="primary"
                  disabled={event.maxAttendees && event.attendees?.length >= event.maxAttendees}
                >
                  Join
                </Button>
              )}
            </>
          )}

          {canEdit && (
            <IconButton
              size="small"
              onClick={() => {
                // Handle edit
                console.log('Edit event:', event._id);
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Events
        </Typography>
        {canCreateEvent && (
          <Fab
            color="primary"
            aria-label="create event"
            onClick={() => setCreateDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Events" />
          <Tab label="My Events" />
          {canCreateEvent && <Tab label="Organizing" />}
        </Tabs>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Search events..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />

        {tabValue === 0 && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>

      {filteredEvents.length === 0 && (
        <Box textAlign="center" py={8}>
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 
              ? "There are no events matching your criteria."
              : tabValue === 1
              ? "You haven't joined any events yet."
              : "You haven't organized any events yet."
            }
          </Typography>
        </Box>
      )}

      {/* Event Details Dialog */}
      <Dialog
        open={eventDetailsOpen}
        onClose={() => setEventDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {selectedEvent.title}
                <Chip
                  label={getStatusLabel(selectedEvent.status)}
                  color={getStatusColor(selectedEvent.status)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2 }}>
                      {selectedEvent.clubId.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedEvent.clubId.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Organized by {selectedEvent.organizer.firstName} {selectedEvent.organizer.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(selectedEvent.dateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedEvent.attendees?.length || 0} attending
                      {selectedEvent.maxAttendees && ` (max ${selectedEvent.maxAttendees})`}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedEvent.description}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEventDetailsOpen(false)}>
                Close
              </Button>
              {selectedEvent.status === 'upcoming' && (
                <>
                  {selectedEvent.attendees?.some(attendee => attendee._id === user?._id) ? (
                    <Button
                      startIcon={<LeaveIcon />}
                      onClick={() => {
                        handleLeaveEvent(selectedEvent._id);
                        setEventDetailsOpen(false);
                      }}
                      color="error"
                    >
                      Leave Event
                    </Button>
                  ) : (
                    <Button
                      startIcon={<JoinIcon />}
                      onClick={() => {
                        handleJoinEvent(selectedEvent._id);
                        setEventDetailsOpen(false);
                      }}
                      color="primary"
                      disabled={selectedEvent.maxAttendees && selectedEvent.attendees?.length >= selectedEvent.maxAttendees}
                    >
                      Join Event
                    </Button>
                  )}
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Event Dialog */}
      <EventCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onEventCreated={(newEvent) => {
          fetchEvents(); // Refresh the events list
          setCreateDialogOpen(false);
        }}
      />
    </Container>
  );
};

export default Events;
