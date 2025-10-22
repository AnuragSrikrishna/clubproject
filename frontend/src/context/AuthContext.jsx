import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
}

// Action types
const actionTypes = {
  USER_LOADED: 'USER_LOADED',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    case actionTypes.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      }
    case actionTypes.AUTH_SUCCESS:
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      }
    case actionTypes.AUTH_ERROR:
    case actionTypes.LOGOUT:
      localStorage.removeItem('token')
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      }
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Set axios default headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token)
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me')
        dispatch({
          type: actionTypes.USER_LOADED,
          payload: res.data.user,
        })
      } catch (error) {
        console.error('Load user error:', error)
        dispatch({ type: actionTypes.AUTH_ERROR })
      }
    } else {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  // Register user
  const register = async (formData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      
      const res = await axios.post('http://localhost:5000/api/auth/register', formData)
      
      dispatch({
        type: actionTypes.AUTH_SUCCESS,
        payload: res.data,
      })
      
      setAuthToken(res.data.token)
      toast.success('Registration successful!')
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      const message = error.response?.data?.message || 'Registration failed'
      
      dispatch({ type: actionTypes.AUTH_ERROR })
      toast.error(message)
      
      return { success: false, message }
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
      
      dispatch({
        type: actionTypes.AUTH_SUCCESS,
        payload: res.data,
      })
      
      setAuthToken(res.data.token)
      toast.success('Login successful!')
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || 'Login failed'
      
      dispatch({ type: actionTypes.AUTH_ERROR })
      toast.error(message)
      
      return { success: false, message }
    }
  }

  // Logout
  const logout = () => {
    dispatch({ type: actionTypes.LOGOUT })
    setAuthToken(null)
    toast.success('Logged out successfully')
  }

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', profileData)
      
      dispatch({
        type: actionTypes.UPDATE_USER,
        payload: res.data.user,
      })
      
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('http://localhost:5000/api/auth/password', {
        currentPassword,
        newPassword,
      })
      
      toast.success('Password changed successfully!')
      return { success: true }
    } catch (error) {
      console.error('Password change error:', error)
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    loadUser,
    hasRole: (role) => state.user?.role === role,
    isClubHead: () => state.user?.role === 'club_head',
    isSuperAdmin: () => state.user?.role === 'super_admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
