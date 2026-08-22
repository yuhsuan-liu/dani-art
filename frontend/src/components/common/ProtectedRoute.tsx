import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  requireAdmin?: boolean
  requireArtist?: boolean
}

export function ProtectedRoute({ requireAdmin = false, requireArtist = true }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isArtist, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Admin Access Required</h1>
        <p className="mt-4 text-stone-600">
          This page requires administrator privileges.
        </p>
      </div>
    )
  }

  if (requireArtist && !isArtist) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Artist Access Required</h1>
        <p className="mt-4 text-stone-600">
          You're logged in but not registered as an artist.
          Contact the admin to get artist access.
        </p>
      </div>
    )
  }

  return <Outlet />
}
