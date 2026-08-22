import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/common/Layout'
import { ArtManagement } from './pages/ArtManagement'
import { Artist } from './pages/Artist'
import { Blog } from './pages/Blog'
import { Dashboard } from './pages/Dashboard'
import { Home } from './pages/Home'
import { Login } from './pages/Login'

/** Vite BASE_URL is `/` in dev and `/dani_art/` in production builds. */
const basename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/artists/:artistId" element={<Artist />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            {/* Public for local verify until OAuth is required again */}
            <Route path="/manage/art" element={<ArtManagement />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
