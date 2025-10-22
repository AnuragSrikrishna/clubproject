import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
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
import API from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const AdminDashboard = () => {
  const { user } = useAuth()
  
  // State variables
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [clubs, setClubs] = useState([])
  const [clubsWithoutHead, setClubsWithoutHead] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [tabValue, setTabValue] = useState(0)
  
  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignClubHeadDialogOpen, setAssignClubHeadDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedClub, setSelectedClub] = useState(null)
  const [selectedClubHead, setSelectedClubHead] = useState('')
  const [newRole, setNewRole] = useState('')
  const [assignedClub, setAssignedClub] = useState('')
  const [deleteClubDialogOpen, setDeleteClubDialogOpen] = useState(false)
  const [selectedClubToDelete, setSelectedClubToDelete] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
    fetchUsers()
    fetchClubs()
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
      const allUsers = response.data.data || response.data
      setUsers(allUsers.slice((page - 1) * 10, page * 10))
      setTotalPages(Math.ceil(allUsers.length / 10))
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
      setClubs(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast.error('Failed to load clubs')
    }
  }

  const fetchClubsWithoutHead = async () => {
    try {
      const response = await API.get('/admin/clubs/no-head')
      setClubsWithoutHead(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching clubs without head:', error)
      toast.error('Failed to load clubs without heads')
    }
  }

  // Handle delete club
  const handleDeleteClub = async () => {
    if (!selectedClubToDelete) return

    try {
      await API.delete(`/admin/clubs/${selectedClubToDelete._id}`)
      toast.success('Club deleted successfully')
      setDeleteClubDialogOpen(false)
      setSelectedClubToDelete(null)
      fetchClubs()
    } catch (error) {
      console.error('Error deleting club:', error)
      toast.error('Failed to delete club')
    }
  }

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return

    try {
      const payload = { role: newRole }
      
      if (newRole === 'club_head' && assignedClub) {
        payload.assignedClub = assignedClub
      }

      await API.put(`/admin/users/${selectedUser._id}/role`, payload)
      toast.success('User role updated successfully')
      
      setRoleDialogOpen(false)
      setSelectedUser(null)
      setNewRole('')
      setAssignedClub('')
      
      fetchUsers()
      fetchClubs()
      fetchClubsWithoutHead()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await API.delete(`/admin/users/${selectedUser._id}`)
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  // Handle assign club head
  const handleAssignClubHead = async () => {
    if (!selectedClub || !selectedClubHead) return

    try {
      await API.put(`/admin/clubs/${selectedClub._id}/assign-head`, {
        clubHeadId: selectedClubHead
      })
      toast.success('Club head assigned successfully')
      setAssignClubHeadDialogOpen(false)
      setSelectedClub(null)
      setSelectedClubHead('')
      
      fetchClubsWithoutHead()
      fetchUsers()
      fetchClubs()
    } catch (error) {
      console.error('Error assigning club head:', error)
      toast.error('Failed to assign club head')
    }
  }

  // Filter users based on search and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = (user.name || user.firstName + ' ' + user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  }) || []

  const openRoleDialog = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setRoleDialogOpen(true)
  }

  const openDeleteDialog = (user) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const openAssignClubHeadDialog = (club) => {
    setSelectedClub(club)
    setAssignClubHeadDialogOpen(true)
  }

  const openDeleteClubDialog = (club) => {
    setSelectedClubToDelete(club)
    setDeleteClubDialogOpen(true)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'error'
      case 'club_head':
        return 'warning'
      case 'student':
        return 'primary'
      default:
        return 'default'
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setPage(1)
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You don't have permission to access this page.</Typography>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Super Admin Dashboard
      </Typography>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalUsers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Clubs
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalClubs || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Events
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalEvents || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SupervisorAccount sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Club Heads
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalClubHeads || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="User Management" />
          <Tab label="Club Management" />
        </Tabs>
      </Box>

      {/* User Management Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Search Users"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                label="Role Filter"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="club_head">Club Heads</MenuItem>
                <MenuItem value="super_admin">Super Admins</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name || `${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.studentId || 'N/A'}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => openRoleDialog(user)}
                        color="primary"
                        size="small"
                        title="Change Role"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => openDeleteDialog(user)}
                        color="error"
                        size="small"
                        title="Delete User"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Box>
      )}

      {/* Club Management Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Clubs Without Heads
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Club Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clubsWithoutHead.map((club) => (
                  <TableRow key={club._id}>
                    <TableCell>{club.name}</TableCell>
                    <TableCell>{club.description}</TableCell>
                    <TableCell>{club.members?.length || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AssignmentInd />}
                        onClick={() => openAssignClubHeadDialog(club)}
                        sx={{ mr: 1 }}
                      >
                        Assign Head
                      </Button>
                      <IconButton
                        onClick={() => openDeleteClubDialog(club)}
                        color="error"
                        size="small"
                        title="Delete Club"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom>
            All Clubs
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Club Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Club Head</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clubs.map((club) => (
                  <TableRow key={club._id}>
                    <TableCell>{club.name}</TableCell>
                    <TableCell>{club.description}</TableCell>
                    <TableCell>
                      {club.clubHead ? (
                        <Box>
                          <Typography variant="body2">{club.clubHead.name || `${club.clubHead.firstName} ${club.clubHead.lastName}`}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {club.clubHead.email}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip label="No Head" color="warning" size="small" icon={<Warning />} />
                      )}
                    </TableCell>
                    <TableCell>{club.members?.length || 0}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => openDeleteClubDialog(club)}
                        color="error"
                        size="small"
                        title="Delete Club"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Dialogs */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            User: {selectedUser?.name || `${selectedUser?.firstName} ${selectedUser?.lastName}`} ({selectedUser?.email})
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              label="Role"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="club_head">Club Head</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
            </Select>
          </FormControl>
          {newRole === 'club_head' && (
            <FormControl fullWidth>
              <InputLabel>Assign Club</InputLabel>
              <Select
                value={assignedClub}
                label="Assign Club"
                onChange={(e) => setAssignedClub(e.target.value)}
              >
                {clubs
                  .filter(club => !club.clubHead)
                  .map(club => (
                    <MenuItem key={club._id} value={club._id}>
                      {club.name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRoleChange} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.name || `${selectedUser?.firstName} ${selectedUser?.lastName}`}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignClubHeadDialogOpen} onClose={() => setAssignClubHeadDialogOpen(false)}>
        <DialogTitle>Assign Club Head</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Club: {selectedClub?.name}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Club Head</InputLabel>
            <Select
              value={selectedClubHead}
              label="Select Club Head"
              onChange={(e) => setSelectedClubHead(e.target.value)}
            >
              {users
                .filter(user => user.role === 'student')
                .map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name || `${user.firstName} ${user.lastName}`} ({user.email})
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignClubHeadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignClubHead} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteClubDialogOpen} onClose={() => setDeleteClubDialogOpen(false)}>
        <DialogTitle>Delete Club</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete club "{selectedClubToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteClubDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteClub} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default AdminDashboard
