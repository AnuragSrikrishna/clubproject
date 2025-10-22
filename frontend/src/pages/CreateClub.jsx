import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Grid,
  Chip,
  InputAdornment,
} from '@mui/material'
import { Group, Email, Schedule, Info } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'

const CreateClub = () => {
  const { user, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin()) {
      toast.error('Only super admins can create clubs')
      navigate('/')
      return
    }
  }, [isSuperAdmin, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      contactEmail: user?.email || '',
    },
  })

  useEffect(() => {
    if (!isSuperAdmin()) {
      toast.error('Only super admins can create clubs')
      navigate('/')
      return
    }
    fetchCategories()
  }, [isSuperAdmin, navigate])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const onSubmit = async (data) => {
    setError('')
    
    try {
      const clubData = {
        ...data,
        tags,
        maxMembers: data.maxMembers ? parseInt(data.maxMembers) : null,
      }

      const response = await axios.post('/api/clubs', clubData)
      
      toast.success('Club created successfully!')
      navigate(`/clubs/${response.data.data._id}`)
    } catch (error) {
      console.error('Error creating club:', error)
      const message = error.response?.data?.message || 'Failed to create club'
      setError(message)
      toast.error(message)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Don't render if not super admin
  if (!isSuperAdmin()) {
    return null
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
            Create New Club
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Start a new club and bring together students who share your interests and passions.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Club Name"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Group />
                      </InputAdornment>
                    ),
                  }}
                  {...register('name', {
                    required: 'Club name is required',
                    minLength: {
                      value: 3,
                      message: 'Club name must be at least 3 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Club name cannot exceed 100 characters',
                    },
                  })}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  id="category"
                  label="Category"
                  {...register('category', {
                    required: 'Category is required',
                  })}
                  error={Boolean(errors.category)}
                  helperText={errors.category?.message}
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{category.icon}</span>
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  id="maxMembers"
                  label="Maximum Members (Optional)"
                  {...register('maxMembers', {
                    min: {
                      value: 1,
                      message: 'Maximum members must be at least 1',
                    },
                  })}
                  error={Boolean(errors.maxMembers)}
                  helperText={errors.maxMembers?.message || 'Leave empty for unlimited'}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  id="description"
                  label="Description"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                        <Info />
                      </InputAdornment>
                    ),
                  }}
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters',
                    },
                    maxLength: {
                      value: 1000,
                      message: 'Description cannot exceed 1000 characters',
                    },
                  })}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="contactEmail"
                  label="Contact Email"
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  {...register('contactEmail', {
                    required: 'Contact email is required',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  error={Boolean(errors.contactEmail)}
                  helperText={errors.contactEmail?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="meetingSchedule"
                  label="Meeting Schedule (Optional)"
                  placeholder="e.g., Every Tuesday 7 PM"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule />
                      </InputAdornment>
                    ),
                  }}
                  {...register('meetingSchedule')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  id="requirements"
                  label="Membership Requirements (Optional)"
                  placeholder="Any specific requirements for joining..."
                  {...register('requirements')}
                />
              </Grid>

              {/* Tags Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <TextField
                  fullWidth
                  id="tagInput"
                  label="Add Tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Type a tag and press Enter"
                  InputProps={{
                    endAdornment: (
                      <Button onClick={handleAddTag} disabled={!tagInput.trim()}>
                        Add
                      </Button>
                    ),
                  }}
                />
                
                {tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 4, mb: 2, py: 1.5 }}
              size="large"
            >
              {isSubmitting ? 'Creating Club...' : 'Create Club'}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              By creating a club, you agree to be responsible for its management and activities.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default CreateClub
