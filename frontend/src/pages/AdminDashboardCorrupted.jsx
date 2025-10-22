import React, { useState, useEffect } from 'react'
import {
  Container,
  Typ  const fetchDashboardStats = async () => {
    try {
      const response = await API.get('/admin/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    }
  }
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Alert,
} from '@mui/material'
import {
  People,
  Group,
  TrendingUp,
  Edit,
  Delete,
  Search,
  Add,
  SupervisorAccount,
  AssignmentInd,
  Warning,
} from '@mui/icons-material'
import axios from 'axios'
import API from '../services/api'
import toast from 'react-hot-toast'

import { useAuth } from '../contexts/AuthContext'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [clubs, setClubs] = useState([])
  const [clubsWithoutHead, setClubsWithoutHead] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedClub, setSelectedClub] = useState(null)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignHeadDialogOpen, setAssignHeadDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [tabValue, setTabValue] = useState(0)
  const [selectedClubForRole, setSelectedClubForRole] = useState('')
  const [userMemberClubs, setUserMemberClubs] = useState([])
  const [deleteClubDialogOpen, setDeleteClubDialogOpen] = useState(false)
  const [selectedClubToDelete, setSelectedClubToDelete] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
    fetchUsers()
    fetchClubs() // Always fetch clubs for role assignment dropdown
    if (tabValue === 1) {
      fetchClubsWithoutHead()
    }
  }, [page, searchTerm, roleFilter, tabValue])

  const fetchDashboardStats = async () => {
    try {
      const response = await API.get('/admin/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await API.get('/admin/users')
      setUsers(response.data.data.slice((page - 1) * 10, page * 10))
      setTotalPages(Math.ceil(response.data.data.length / 10))
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchClubs = async () => {
    try {
      const response = await API.get('/admin/clubs')
      setClubs(response.data.data)
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast.error('Failed to load clubs')
    }
  }

  const fetchClubsWithoutHead = async () => {
    try {
      const response = await API.get('/admin/clubs/no-head')
      setClubsWithoutHead(response.data.data)
    } catch (error) {
      console.error('Error fetching clubs without head:', error)
      toast.error('Failed to load clubs without heads')
    }
  }

  const fetchUserMemberClubs = async (userId) => {
    try {
      // For now, return empty array since we don't have this endpoint
      setUserMemberClubs([])
    } catch (error) {
      console.error('Error fetching user member clubs:', error)
      toast.error('Failed to load user clubs')
      setUserMemberClubs([])
    }
  }

  const handleDeleteClub = async () => {
    if (!selectedClubToDelete) return

    try {
      await API.delete(`/admin/clubs/${selectedClubToDelete._id}`)
      
      toast.success('Club deleted successfully')
      setDeleteClubDialogOpen(false)
      setSelectedClubToDelete(null)
      fetchClubs() // Refresh clubs list
    } catch (error) {
      console.error('Error deleting club:', error)
      toast.error(error.response?.data?.message || 'Failed to delete club')
    }
  }

  const handleRoleChange = async (newRole) => {
    try {
      const payload = { role: newRole }
      
      // If promoting to club head and a club is selected, include it
      if (newRole === 'club_head' && selectedClubForRole) {
        payload.clubId = selectedClubForRole
      }

      await API.put(`/admin/users/${selectedUser._id}/role`, payload)
      
      toast.success(`User role updated to ${newRole}`)
      setRoleDialogOpen(false)
      setSelectedUser(null)
      setSelectedClubForRole('')
      setUserMemberClubs([]) // Clear user member clubs
      fetchUsers()
      fetchClubs() // Refresh clubs to show updated club heads
      fetchClubsWithoutHead() // Refresh clubs without heads
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error(error.response?.data?.message || 'Failed to update user role')
    }
  }

  const handleDeleteUser = async () => {
    try {
      await API.delete(`/admin/users/${selectedUser._id}`)
      
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleAssignClubHead = async () => {
    try {
      await API.put(`/admin/clubs/${selectedClub._id}/assign-head`, {
        userId: selectedUser._id
      })
      
      toast.success(`Club head assigned successfully`)
      setAssignHeadDialogOpen(false)
      setSelectedUser(null)
      setSelectedClub(null)
      fetchClubsWithoutHead()
      fetchUsers()
    } catch (error) {
      console.error('Error assigning club head:', error)
      toast.error(error.response?.data?.message || 'Failed to assign club head')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'error'
      case 'club_head':
        return 'primary'
      case 'student':
        return 'default'
      default:
        return 'default'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'club_head':
        return 'Club Head'
      case 'student':
        return 'Student'
      default:
        return role
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Group sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalClubs || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Clubs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SupervisorAccount sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalClubHeads || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Club Heads
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.recentUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New Users (30d)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warning for clubs without heads */}
      {clubsWithoutHead.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">⚠️ Action Required</Typography>
          <Typography>
            {clubsWithoutHead.length} club(s) need a club head assigned. Switch to the "Club Management" tab to assign club heads.
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="User Management" />
          <Tab label="Club Management" />
        </Tabs>

        {/* User Management Tab */}
        {tabValue === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                User Management
              </Typography>
            </Box>

            {/* Search and Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                select
                label="Filter by Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="club_head">Club Heads</MenuItem>
                <MenuItem value="super_admin">Super Admins</MenuItem>
              </TextField>
            </Box>

            {/* Users Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData._id}>
                      <TableCell>
                        {userData.firstName} {userData.lastName}
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>{userData.studentId}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleLabel(userData.role)} 
                          color={getRoleColor(userData.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{userData.year}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            setSelectedUser(userData)
                            setRoleDialogOpen(true)
                            // Ensure clubs are loaded for the dropdown
                            if (clubs.length === 0) {
                              fetchClubs()
                            }
                            // Fetch clubs this user is a member of
                            fetchUserMemberClubs(userData._id)
                          }}
                          disabled={userData._id === user.id}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedUser(userData)
                            setDeleteDialogOpen(true)
                          }}
                          disabled={userData._id === user.id}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Club Management Tab */}
        {tabValue === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Club Management
              </Typography>
            </Box>

            {/* Clubs Without Heads */}
            {clubsWithoutHead.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                  <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Clubs Without Club Heads ({clubsWithoutHead.length})
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Club Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Created By</TableCell>
                        <TableCell>Members</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clubsWithoutHead.map((club) => (
                        <TableRow key={club._id}>
                          <TableCell>{club.name}</TableCell>
                          <TableCell>{club.category?.name}</TableCell>
                          <TableCell>
                            {club.creator ? `${club.creator.firstName} ${club.creator.lastName}` : 'Unknown'}
                          </TableCell>
                          <TableCell>{club.members?.length || 0}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AssignmentInd />}
                              onClick={() => {
                                setSelectedClub(club)
                                setAssignHeadDialogOpen(true)
                              }}
                            >
                              Assign Head
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* All Clubs */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Clubs ({clubs.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Club Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Club Head</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clubs.map((club) => (
                    <TableRow key={club._id}>
                      <TableCell>{club.name}</TableCell>
                      <TableCell>{club.category?.name}</TableCell>
                      <TableCell>
                        {club.clubHead ? 
                          `${club.clubHead.firstName} ${club.clubHead.lastName}` : 
                          <Chip label="No Head Assigned" color="warning" size="small" />
                        }
                      </TableCell>
                      <TableCell>{club.memberCount || 0}</TableCell>
                      <TableCell>
                        <Chip 
                          label={club.isActive !== false ? 'Active' : 'Inactive'} 
                          color={club.isActive !== false ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            setSelectedClubToDelete(club)
                            setDeleteClubDialogOpen(true)
                          }}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => {
        setRoleDialogOpen(false)
        setSelectedUser(null)
        setSelectedClubForRole('')
        setUserMemberClubs([])
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Change role for {selectedUser?.firstName} {selectedUser?.lastName}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant={selectedUser?.role === 'student' ? 'contained' : 'outlined'}
              onClick={() => handleRoleChange('student')}
            >
              Student
            </Button>
            
            <Box>
              <Button
                variant={selectedUser?.role === 'club_head' ? 'contained' : 'outlined'}
                onClick={() => selectedUser?.role === 'club_head' ? handleRoleChange('club_head') : null}
                sx={{ width: '100%', mb: selectedUser?.role !== 'club_head' ? 1 : 0 }}
              >
                Club Head
              </Button>
              
              {selectedUser?.role !== 'club_head' && (
                <FormControl fullWidth>
                  <InputLabel>Select Club (Optional)</InputLabel>
                  <Select
                    value={selectedClubForRole}
                    onChange={(e) => setSelectedClubForRole(e.target.value)}
                    label="Select Club (Optional)"
                  >
                    <MenuItem value="">
                      <em>No specific club (can be assigned later)</em>
                    </MenuItem>
                    {userMemberClubs.map((club) => (
                      <MenuItem key={club._id} value={club._id}>
                        {club.name} ({club.memberCount || 0} members)
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Only clubs where this user is already a member are shown. If you select a club, the user will become the head of that club.
                  </Typography>
                </FormControl>
              )}
              
              {selectedUser?.role !== 'club_head' && (
                <Button
                  variant="outlined"
                  onClick={() => handleRoleChange('club_head')}
                  sx={{ width: '100%', mt: 1 }}
                >
                  Promote to Club Head
                </Button>
              )}
            </Box>
            
            <Button
              variant={selectedUser?.role === 'super_admin' ? 'contained' : 'outlined'}
              onClick={() => handleRoleChange('super_admin')}
              color="error"
            >
              Super Admin
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRoleDialogOpen(false)
            setSelectedUser(null)
            setSelectedClubForRole('')
            setUserMemberClubs([])
          }}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Club Head Dialog */}
      <Dialog open={assignHeadDialogOpen} onClose={() => setAssignHeadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Club Head</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Assign a club head for: <strong>{selectedClub?.name}</strong>
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUser?._id || ''}
              onChange={(e) => {
                const user = users.find(u => u._id === e.target.value)
                setSelectedUser(user)
              }}
              label="Select User"
            >
              {users.filter(u => u.role === 'student' || u.role === 'club_head').map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email}) - {getRoleLabel(user.role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedUser && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {selectedUser.role === 'student' ? 
                'This user will be promoted to Club Head and assigned to this club.' :
                'This user will be assigned as the head of this club.'
              }
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignHeadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignClubHead} 
            variant="contained"
            disabled={!selectedUser}
          >
            Assign Club Head
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Club Confirmation Dialog */}
      <Dialog open={deleteClubDialogOpen} onClose={() => setDeleteClubDialogOpen(false)}>
        <DialogTitle>Confirm Delete Club</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the club "{selectedClubToDelete?.name}"?
            This action cannot be undone and will remove all club data, members, and events.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteClubDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteClub} color="error" variant="contained">
            Delete Club
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default AdminDashboard
