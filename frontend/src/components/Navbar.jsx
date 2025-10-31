import React, { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Group,
  Add,
  Person,
  Logout,
  Home,
  AdminPanelSettings,
  Event,
} from '@mui/icons-material'

import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, isAuthenticated, logout, isClubHead, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/')
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navigationItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Clubs', path: '/clubs', icon: <Group /> },
    { text: 'Events', path: '/events', icon: <Event /> },
  ]

  const authenticatedItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  ]

  // Add club creation for super admins only
  if (isSuperAdmin()) {
    authenticatedItems.push({ text: 'Create Club', path: '/create-club', icon: <Add /> })
  }

  // Add admin dashboard for super admins
  if (isSuperAdmin()) {
    authenticatedItems.push({ text: 'Admin Dashboard', path: '/admin', icon: <AdminPanelSettings /> })
  }

  // Add test page for development (when authenticated)


  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        SANGAM
      </Typography>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isAuthenticated &&
          authenticatedItems.map((item) => (
            <ListItem
              key={item.text}
              component={RouterLink}
              to={item.path}
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        {!isAuthenticated && (
          <>
            <ListItem component={RouterLink} to="/login" sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem component={RouterLink} to="/register" sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {/* App logo (place a file at public/logo.png to show) */}
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/images/logo.png"
                alt="SANGAM logo"
                style={{ width: 65, height: 65, objectFit: 'contain', display: 'inline-block' }}
                onError={(e) => {
                  // hide image element if not found
                  e.target.style.display = 'none'
                }}
              />
            </Box>
            
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {isAuthenticated ? (
                <>
                  {authenticatedItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      component={RouterLink}
                      to={item.path}
                      sx={{
                        backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}

                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <Avatar
                      src={user?.profilePicture}
                      sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                    >
                      {user?.firstName?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile')
            handleMenuClose()
          }}
        >
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}

export default Navbar
