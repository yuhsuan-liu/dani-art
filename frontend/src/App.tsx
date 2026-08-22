import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/common/Layout'
import { Artist } from './pages/Artist'
import { Blog } from './pages/Blog'
import { Home } from './pages/Home'
import { Login } from './pages/Login'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/artists/:artistId" element={<Artist />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
