import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  Grid,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Edit, PhotoCamera, Lock } from '@mui/icons-material'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [error, setError] = useState('')
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      year: user?.year || '',
      major: user?.major || '',
      profilePicture: user?.profilePicture || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm()

  const academicYears = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']

  const onSubmit = async (data) => {
    setError('')
    
    const result = await updateProfile(data)
    
    if (!result.success) {
      setError(result.message)
    }
  }

  const onPasswordSubmit = async (data) => {
    const result = await changePassword(data.currentPassword, data.newPassword)
    
    if (result.success) {
      setPasswordDialogOpen(false)
      resetPassword()
    }
  }

  const handleAvatarClick = () => {
    // In a real app, you would handle file upload here
    toast.info('Profile picture upload will be implemented with file handling')
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Profile Settings
          </Typography>

          {/* Profile Picture Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={user?.profilePicture}
                sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem' }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Button
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  minWidth: 'auto',
                  p: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
                onClick={handleAvatarClick}
              >
                <PhotoCamera sx={{ fontSize: 20 }} />
              </Button>
            </Box>
            <Typography variant="h6">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Student ID: {user?.studentId}
            </Typography>
          </Box>

          <Divider sx={{ width: '100%', mb: 4 }} />

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Profile Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoComplete="given-name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  autoComplete="family-name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  id="year"
                  label="Academic Year"
                  {...register('year', {
                    required: 'Academic year is required',
                  })}
                  error={Boolean(errors.year)}
                  helperText={errors.year?.message}
                >
                  {academicYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="major"
                  label="Major"
                  {...register('major', {
                    required: 'Major is required',
                    minLength: {
                      value: 2,
                      message: 'Major must be at least 2 characters',
                    },
                  })}
                  error={Boolean(errors.major)}
                  helperText={errors.major?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="profilePicture"
                  label="Profile Picture URL (Optional)"
                  placeholder="https://example.com/your-photo.jpg"
                  {...register('profilePicture')}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              startIcon={<Edit />}
            >
              {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
            </Button>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }} />

          {/* Security Section */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Security
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setPasswordDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Change Password
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitPassword(onPasswordSubmit)} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              type="password"
              id="currentPassword"
              label="Current Password"
              autoComplete="current-password"
              sx={{ mb: 2 }}
              {...registerPassword('currentPassword', {
                required: 'Current password is required',
              })}
              error={Boolean(passwordErrors.currentPassword)}
              helperText={passwordErrors.currentPassword?.message}
            />

            <TextField
              required
              fullWidth
              type="password"
              id="newPassword"
              label="New Password"
              autoComplete="new-password"
              sx={{ mb: 2 }}
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={Boolean(passwordErrors.newPassword)}
              helperText={passwordErrors.newPassword?.message}
            />

            <TextField
              required
              fullWidth
              type="password"
              id="confirmPassword"
              label="Confirm New Password"
              autoComplete="new-password"
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (value, { newPassword }) =>
                  value === newPassword || 'Passwords do not match',
              })}
              error={Boolean(passwordErrors.confirmPassword)}
              helperText={passwordErrors.confirmPassword?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitPassword(onPasswordSubmit)}
            variant="contained"
            disabled={isPasswordSubmitting}
          >
            {isPasswordSubmitting ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Profile
