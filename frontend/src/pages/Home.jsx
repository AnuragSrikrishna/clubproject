import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  alpha,
} from '@mui/material'
import { Group, Event, Person, TrendingUp } from '@mui/icons-material'

import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const theme = useTheme()

  const features = [
    {
      icon: <Group />,
      title: 'Discover Clubs',
      description: 'Browse and join clubs that match your interests and academic goals.',
    },
    {
      icon: <Event />,
      title: 'Manage Events',
      description: 'Create, organize, and participate in exciting club events and activities.',
    },
    {
      icon: <Person />,
      title: 'Connect with Peers',
      description: 'Meet like-minded students and build lasting friendships through shared interests.',
    },
    {
      icon: <TrendingUp />,
      title: 'Track Progress',
      description: 'Monitor your involvement and see your impact within the club community.',
    },
  ]

  const stats = [
    { number: '5+', label: 'Active Clubs' },
    { number: '100+', label: 'Student Members' },
    { number: '3+', label: 'Events This Year' },
    { number: '4', label: 'Categories' },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Welcome to SANGAM
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Your gateway to discovering, joining, and managing college clubs. Connect with fellow students and make
                the most of your college experience.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      component={RouterLink}
                      to="/register"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.common.white, 0.9),
                        },
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={RouterLink}
                      to="/clubs"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: alpha(theme.palette.common.white, 0.1),
                        },
                      }}
                    >
                      Browse Clubs
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      component={RouterLink}
                      to="/dashboard"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.common.white, 0.9),
                        },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={RouterLink}
                      to="/clubs"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: alpha(theme.palette.common.white, 0.1),
                        },
                      }}
                    >
                      Explore Clubs
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                  },
                }}
              >
                {/* You can add an illustration or image here */}
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    bgcolor: '#ffffff',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Attempt to load site logo from public folder; fallback to emojis if missing */}
                  <Box sx={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src="/images/logo.png"
                      alt="SANGAM logo"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        // reveal emoji fallback by removing display:none from sibling
                        const fallback = e.target.nextSibling
                        if (fallback) fallback.style.display = 'block'
                      }}
                    />
                    <Typography variant="h4" sx={{ opacity: 0.7, display: 'none' }}>
                      🎓📚🤝
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    height: '100%',
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                      theme.palette.secondary.main,
                      0.1
                    )} 100%)`,
                  }}
                >
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
            Why Choose SANGAM?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {index < 2 ? (
                    <Box
                      component={RouterLink}
                      to={index === 0 ? '/clubs' : '/events'}
                      sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mb: 2,
                          '& > *': {
                            fontSize: 48,
                            color: 'primary.main',
                          },
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mb: 2,
                          '& > *': {
                            fontSize: 48,
                            color: 'primary.main',
                          },
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Categories Preview */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Club Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {[
              { name: 'Academic', icon: '📚', color: '#3B82F6' },
              { name: 'Sports & Recreation', icon: '⚽', color: '#10B981' },
              { name: 'Arts & Culture', icon: '🎨', color: '#8B5CF6' },
              { name: 'Technology', icon: '💻', color: '#F59E0B' },
            
            ].map((category) => (
              <Chip
                key={category.name}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Box>
                }
                sx={{
                  p: 1,
                  fontSize: '1rem',
                  bgcolor: alpha(category.color, 0.1),
                  color: category.color,
                  fontWeight: 'medium',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join SANGAM  today and start your journey of discovery, connection, and growth.
          </Typography>
          {!isAuthenticated && (
            <Button variant="outlined" size="large" component={RouterLink} to="/register" sx={{ mr: 2 }}>
              Sign Up Now
            </Button>
          )}
          <Button variant="outlined" size="large" component={RouterLink} to="/clubs">
            Explore Clubs
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default Home
