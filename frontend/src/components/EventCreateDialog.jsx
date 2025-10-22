import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventCreateDialog = ({ open, onClose, onEventCreated }) => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clubId: '',
    dateTime: '',
    endDateTime: '',
    location: '',
    maxAttendees: '',
    requirements: '',
    imageUrl: '',
    tags: '',
    isPublic: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchUserClubs();
      resetForm();
    }
  }, [open]);

  const fetchUserClubs = async () => {
    try {
      setLoading(true);
      let clubsData = [];
      
      if (user?.role === 'super_admin') {
        // Super admin can create events for any club
        const response = await axios.get('/api/clubs?limit=100');
        clubsData = response.data.data;
      } else if (user?.role === 'club_head') {
        // Club head can only create events for their clubs
        // First try the managed clubs endpoint, fallback to user clubs
        try {
          const response = await axios.get('/api/clubs/user/managed-clubs');
          clubsData = response.data.data;
        } catch (error) {
          // Fallback to user's joined clubs
          const response = await axios.get('/api/clubs/user/my-clubs');
          clubsData = response.data.data.filter(club => 
            club.clubHead === user.id || (club.admins && club.admins.includes(user.id))
          );
        }
      }
      
      setClubs(clubsData);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs. Please try again later.');
      // Set some mock data for demo purposes if backend is not available
      if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        setClubs([
          { _id: 'demo1', name: 'Programming Club (Demo)' },
          { _id: 'demo2', name: 'Photography Club (Demo)' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clubId: '',
      dateTime: '',
      endDateTime: '',
      location: '',
      maxAttendees: '',
      requirements: '',
      imageUrl: '',
      tags: '',
      isPublic: true
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.clubId) {
      newErrors.clubId = 'Please select a club';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Start date and time is required';
    }

    if (!formData.endDateTime) {
      newErrors.endDateTime = 'End date and time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }

    // Validate dates
    if (formData.dateTime && formData.endDateTime) {
      const startDate = new Date(formData.dateTime);
      const endDate = new Date(formData.endDateTime);
      const now = new Date();

      if (startDate <= now) {
        newErrors.dateTime = 'Start date must be in the future';
      }

      if (endDate <= startDate) {
        newErrors.endDateTime = 'End date must be after start date';
      }
    }

    // Validate max attendees
    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) < 1)) {
      newErrors.maxAttendees = 'Max attendees must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const eventData = {
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const response = await axios.post('/api/events', eventData);
      
      toast.success('Event created successfully!');
      onEventCreated && onEventCreated(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create event');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  // Format datetime for input (datetime-local requires YYYY-MM-DDTHH:MM format)
  const formatDateTimeForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle>
        Create New Event
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : clubs.length === 0 ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {user?.role === 'super_admin' 
              ? 'No clubs available. Please create a club first.'
              : 'You are not managing any clubs. Contact a super admin to be assigned as a club head.'
            }
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Event Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="e.g., JavaScript Workshop, Annual Hackathon"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Event Description"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Describe what the event is about, what attendees can expect..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.clubId}>
                  <InputLabel>Club</InputLabel>
                  <Select
                    name="clubId"
                    value={formData.clubId}
                    onChange={handleInputChange}
                    label="Club"
                  >
                    {clubs.map((club) => (
                      <MenuItem key={club._id} value={club._id}>
                        {club.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.clubId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.clubId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  placeholder="e.g., Computer Lab A, Main Auditorium"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="dateTime"
                  label="Start Date & Time"
                  type="datetime-local"
                  fullWidth
                  required
                  value={formatDateTimeForInput(formData.dateTime)}
                  onChange={handleInputChange}
                  error={!!errors.dateTime}
                  helperText={errors.dateTime}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="endDateTime"
                  label="End Date & Time"
                  type="datetime-local"
                  fullWidth
                  required
                  value={formatDateTimeForInput(formData.endDateTime)}
                  onChange={handleInputChange}
                  error={!!errors.endDateTime}
                  helperText={errors.endDateTime}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="maxAttendees"
                  label="Max Attendees (Optional)"
                  type="number"
                  fullWidth
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  error={!!errors.maxAttendees}
                  helperText={errors.maxAttendees || 'Leave empty for unlimited attendees'}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="tags"
                  label="Tags (Optional)"
                  fullWidth
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., workshop, networking, beginner-friendly"
                  helperText="Separate multiple tags with commas"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="requirements"
                  label="Requirements (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="Any prerequisites, materials to bring, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="imageUrl"
                  label="Event Image URL (Optional)"
                  fullWidth
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || loading || clubs.length === 0}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting ? 'Creating...' : 'Create Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventCreateDialog;
