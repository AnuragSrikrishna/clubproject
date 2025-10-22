import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requireClubHead = false, requireSuperAdmin = false }) => {
  const { isAuthenticated, loading, isClubHead, isSuperAdmin } = useAuth()

  if (loading) {
    return null // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireClubHead && !isClubHead()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
