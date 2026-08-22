import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute() {
  const { user, loading, isArtist } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isArtist) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Access Denied</h1>
        <p className="mt-4 text-stone-600">
          You're logged in but not registered as an artist.
          Contact the admin to get artist access.
        </p>
      </div>
    )
  }

  return <Outlet />
}
