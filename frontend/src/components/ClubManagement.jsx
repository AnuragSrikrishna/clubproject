import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Announcement as AnnouncementIcon,
  Group,
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const ClubManagement = ({ club, onUpdate }) => {
  const [tabValue, setTabValue] = useState(0)
  const [announcements, setAnnouncements] = useState([])
  const [membershipRequests, setMembershipRequests] = useState([])
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium',
    expiresAt: ''
  })

  useEffect(() => {
    if (club) {
      fetchAnnouncements()
      fetchMembershipRequests()
    }
  }, [club])

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`/api/clubs/${club._id}/announcements`)
      setAnnouncements(response.data.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const fetchMembershipRequests = async () => {
    try {
      const response = await axios.get(`/api/clubs/${club._id}/membership-requests`)
      setMembershipRequests(response.data.data)
    } catch (error) {
      console.error('Error fetching membership requests:', error)
    }
  }

  const handleCreateAnnouncement = async () => {
    try {
      await axios.post(`/api/clubs/${club._id}/announcements`, newAnnouncement)
      toast.success('Announcement created successfully!')
      setAnnouncementDialogOpen(false)
      setNewAnnouncement({ title: '', content: '', priority: 'medium', expiresAt: '' })
      fetchAnnouncements()
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error(error.response?.data?.message || 'Failed to create announcement')
    }
  }

  const handleRespondToRequest = async (requestId, status, adminResponse = '') => {
    try {
      let endpoint;
      let body = {};
      
      if (status === 'approved') {
        endpoint = `/api/clubs/${club._id}/membership-requests/${requestId}/accept`;
      } else if (status === 'rejected') {
        endpoint = `/api/clubs/${club._id}/membership-requests/${requestId}/reject`;
        body = { reason: adminResponse };
      }
      
      await axios.put(endpoint, body)
      toast.success(`Membership request ${status}!`)
      
      // Refresh both membership requests and club data
      await fetchMembershipRequests()
      if (onUpdate) onUpdate() // Refresh club data including members list
    } catch (error) {
      console.error('Error responding to request:', error)
      toast.error(error.response?.data?.message || 'Failed to respond to request')
    }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the club?`)) {
      return
    }

    try {
      await axios.delete(`/api/clubs/${club._id}/members/${memberId}`)
      toast.success('Member removed successfully!')
      if (onUpdate) onUpdate() // Refresh club data
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error(error.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleToggleJoining = async () => {
    try {
      await axios.put(`/api/clubs/${club._id}/toggle-joining`)
      toast.success(`Club joining ${club.allowJoining ? 'disabled' : 'enabled'} successfully!`)
      if (onUpdate) onUpdate() // Refresh club data
    } catch (error) {
      console.error('Error toggling joining:', error)
      toast.error(error.response?.data?.message || 'Failed to toggle joining')
    }
  }

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
    <Box>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<AnnouncementIcon />} label="Announcements" />
        <Tab icon={<Group />} label="Membership Requests" />
        <Tab icon={<Group />} label="Members" />
      </Tabs>

      {/* Announcements Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Club Announcements</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAnnouncementDialogOpen(true)}
            >
              New Announcement
            </Button>
          </Box>

          {announcements.length === 0 ? (
            <Alert severity="info">No announcements yet. Create the first one!</Alert>
          ) : (
            <List>
              {announcements.map((announcement) => (
                <Card key={announcement._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {announcement.title}
                      </Typography>
                      <Chip 
                        label="ANNOUNCEMENT" 
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {announcement.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Posted by {announcement.author?.firstName} {announcement.author?.lastName} on {formatDate(announcement.createdAt)}
                      {announcement.expiresAt && ` • Expires: ${formatDate(announcement.expiresAt)}`}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* Membership Requests Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Pending Membership Requests ({membershipRequests.filter(r => r.status === 'pending').length})
          </Typography>

          {membershipRequests.filter(r => r.status === 'pending').length === 0 ? (
            <Alert severity="info">No pending membership requests.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membershipRequests
                    .filter(request => request.status === 'pending')
                    .map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={request.user?.profilePicture}>
                            {request.user?.firstName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {request.user?.firstName} {request.user?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {request.user?.year} • {request.user?.major}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {request.user?.studentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {request.message || 'No message provided'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.requestedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            color="success"
                            onClick={() => handleRespondToRequest(request._id, 'approved')}
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircle />}
                          >
                            Approve
                          </Button>
                          <Button
                            color="error"
                            onClick={() => {
                              setSelectedRequestId(request._id)
                              setRejectionDialogOpen(true)
                            }}
                            size="small"
                            variant="outlined"
                            startIcon={<Cancel />}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Members Tab */}
      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Club Members ({club.members?.length || 0})
            </Typography>
            <Button
              variant={club.allowJoining ? "outlined" : "contained"}
              color={club.allowJoining ? "error" : "success"}
              onClick={handleToggleJoining}
            >
              {club.allowJoining ? 'Disable Joining' : 'Enable Joining'}
            </Button>
          </Box>

          <Alert severity={club.allowJoining ? "success" : "warning"} sx={{ mb: 3 }}>
            Club joining is currently <strong>{club.allowJoining ? 'enabled' : 'disabled'}</strong>. 
            {club.allowJoining 
              ? ' Students can submit membership requests.' 
              : ' Students cannot join this club at the moment.'
            }
          </Alert>

          {!club.members || club.members.length === 0 ? (
            <Alert severity="info">No members yet.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {club.members.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={member.profilePicture}>
                            {member.firstName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {member.firstName} {member.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {member.year} • {member.major}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {member.studentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {club.clubHead && club.clubHead._id === member._id ? (
                          <Chip label="Club Head" color="primary" size="small" />
                        ) : (
                          <Chip label="Member" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(member.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {club.clubHead && club.clubHead._id !== member._id && (
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveMember(member._id, `${member.firstName} ${member.lastName}`)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Create Announcement Dialog */}
      <Dialog 
        open={announcementDialogOpen} 
        onClose={() => setAnnouncementDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="datetime-local"
              label="Expires At (Optional)"
              value={newAnnouncement.expiresAt}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, expiresAt: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnouncementDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAnnouncement}
            variant="contained"
            disabled={!newAnnouncement.title || !newAnnouncement.content}
          >
            Create Announcement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Confirmation Dialog */}
      <Dialog 
        open={rejectionDialogOpen} 
        onClose={() => {
          setRejectionDialogOpen(false)
          setSelectedRequestId(null)
          setRejectionReason('')
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Membership Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Are you sure you want to reject this membership request? You can provide a reason that will be shared with the applicant.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for rejection (optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Not meeting current requirements, club is full, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setRejectionDialogOpen(false)
              setSelectedRequestId(null)
              setRejectionReason('')
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              handleRespondToRequest(selectedRequestId, 'rejected', rejectionReason)
              setRejectionDialogOpen(false)
              setSelectedRequestId(null)
              setRejectionReason('')
            }}
            variant="contained"
            color="error"
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ClubManagement
