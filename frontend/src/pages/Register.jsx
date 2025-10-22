import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
  Grid,
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Person, School, Badge } from '@mui/icons-material'

import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const academicYears = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    setError('')
    
    const result = await registerUser(data)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
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
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoComplete="given-name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
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

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="College Email Address"
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="studentId"
                  label="Student ID"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    ),
                  }}
                  {...register('studentId', {
                    required: 'Student ID is required',
                    minLength: {
                      value: 4,
                      message: 'Student ID must be at least 4 characters',
                    },
                  })}
                  error={Boolean(errors.studentId)}
                  helperText={errors.studentId?.message}
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

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="major"
                  label="Major"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School />
                      </InputAdornment>
                    ),
                  }}
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
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register
