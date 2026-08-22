import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-pill-active' : 'nav-pill'

export function Header() {
  const { isAuthenticated, isArtist, loading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/artists/dani" className={navLinkClass} onClick={() => setMenuOpen(false)}>
        Art
      </NavLink>
      <NavLink to="/blog" className={navLinkClass} onClick={() => setMenuOpen(false)}>
        Notes
      </NavLink>
      {isAuthenticated && isArtist && (
        <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
          Studio
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white pt-safe-t">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" end className="font-serif text-xl text-stone-900 sm:text-2xl">
          Dani
        </NavLink>

        <nav aria-label="Primary" className="nav-bar hidden sm:flex">
          {navItems}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <NavLink to="/login" className="btn-b px-3 text-xs sm:px-5 sm:text-sm">
              Log in
            </NavLink>
          ) : isAuthenticated ? (
            <button type="button" onClick={() => signOut()} className="btn-c">
              Sign out
            </button>
          ) : (
            <NavLink to="/login" className="btn-b px-3 text-xs sm:px-5 sm:text-sm">
              Log in
            </NavLink>
          )}

          <button
            type="button"
            className="btn-c px-3 sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-stone-200 bg-white px-4 py-3 pb-safe-b sm:hidden"
        >
          <div className="nav-bar flex-col">{navItems}</div>
        </nav>
      )}
    </header>
  )
}
