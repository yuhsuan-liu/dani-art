import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-pill-active' : 'nav-pill'

export function Header() {
  const { isAuthenticated, isArtist, loading, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white pt-safe-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" end className="font-serif text-xl text-stone-900 sm:text-2xl">
          Dani
        </NavLink>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="px-2 text-sm text-stone-400">…</span>
          ) : isAuthenticated && isArtist ? (
            <button type="button" onClick={() => signOut()} className="btn-c">
              Sign out
            </button>
          ) : isAuthenticated ? (
            <button type="button" onClick={() => signOut()} className="btn-c">
              Sign out
            </button>
          ) : (
        <NavLink to="/login" className="btn-b px-3 text-xs sm:px-5 sm:text-sm">
              Log in
            </NavLink>
          )}
        </div>

        <nav aria-label="Primary" className="nav-bar order-last w-full sm:order-none sm:w-auto">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/artists/dani" className={navLinkClass}>
            Art
          </NavLink>
          <NavLink to="/blog" className={navLinkClass}>
            Notes
          </NavLink>
          {isAuthenticated && isArtist && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Studio
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
