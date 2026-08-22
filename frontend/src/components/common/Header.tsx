import { Link, NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm tracking-wide ${
    isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-900'
  }`

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-serif text-lg text-stone-900 sm:text-xl">
          Dani's Art Registry
        </Link>
        <nav className="flex items-center gap-5">
          <NavLink to="/blog" className={navLinkClass}>
            Blog
          </NavLink>
          <NavLink to="/login" className={navLinkClass}>
            Artist Login
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
