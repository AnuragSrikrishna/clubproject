import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material'
import { Search, Group, Person } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const Clubs = () => {
  const [clubs, setClubs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchClubs()
  }, [page, selectedCategory, searchTerm])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      })

      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await axios.get(`/api/clubs?${params}`)
      setClubs(response.data.data)
      setTotalPages(response.data.pagination.pages)
      setError('')
    } catch (error) {
      console.error('Error fetching clubs:', error)
      setError('Failed to load clubs')
      toast.error('Failed to load clubs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setPage(1) // Reset to first page
  }

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value)
    setPage(1) // Reset to first page
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && clubs.length === 0) {
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
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
        Discover Clubs
      </Typography>

      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Filter by Category"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
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
        </Grid>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Clubs Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : clubs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No clubs found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria or explore different categories.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {clubs.map((club) => (
              <Grid item xs={12} sm={6} md={4} key={club._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={club.logo}
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 2,
                          bgcolor: club.category?.color || 'primary.main',
                        }}
                      >
                        {club.category?.icon || club.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                          {club.name}
                        </Typography>
                        <Chip
                          label={club.category?.name}
                          size="small"
                          sx={{
                            bgcolor: club.category?.color + '20',
                            color: club.category?.color,
                            fontWeight: 'medium',
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {club.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Group fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {club.memberCount} members
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Club Head: {club.clubHead?.firstName} {club.clubHead?.lastName}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      component={RouterLink}
                      to={`/clubs/${club._id}`}
                      variant="contained"
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default Clubs
