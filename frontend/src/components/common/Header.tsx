import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm tracking-wide ${
    isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-900'
  }`

export function Header() {
  const { user, isAuthenticated, isArtist, loading, signOut } = useAuth()

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-serif text-lg text-stone-900 sm:text-xl">
          Dani's Art Registry
        </Link>
        <nav className="flex items-center gap-5">
          <NavLink to="/artists/dani" className={navLinkClass}>
            Floor Map
          </NavLink>
          <NavLink to="/manage/art" className={navLinkClass}>
            Manage Art
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/blog" className={navLinkClass}>
            Blog
          </NavLink>

          {loading ? (
            <span className="text-sm text-stone-400">...</span>
          ) : isAuthenticated && isArtist ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-stone-500 hover:text-stone-900"
            >
              Sign Out
            </button>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-stone-500">Hi, {user?.name}</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm text-stone-500 hover:text-stone-900"
              >
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Artist Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
