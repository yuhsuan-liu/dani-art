import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/common/Layout'
import { ArtManagement } from './pages/ArtManagement'
import { Artist } from './pages/Artist'
import { Blog } from './pages/Blog'
import { Dashboard } from './pages/Dashboard'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { OrderPage } from './pages/Order'
import { OrderManagement } from './pages/OrderManagement'

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
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/artists/:artistId" element={<Artist />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/order/:artworkId" element={<OrderPage />} />
            
            {/* Artist/Admin routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage/art" element={<ArtManagement />} />
            <Route path="/manage/orders" element={<OrderManagement />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
