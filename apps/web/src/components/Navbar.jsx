import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCopy } from '../lib/copy.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const nav = useCopy('nav') || {}
  const meta = useCopy('meta') || {}
  const links = nav.links || []
  const cta = nav.cta || { label: 'Contact →', to: '/contact' }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 border-b border-line"
      style={{
        background: scrolled ? 'rgba(11,10,8,.75)' : 'rgba(11,10,8,.4)',
        backdropFilter: 'blur(14px)'
      }}
    >
      <div className="max-w-[1320px] mx-auto px-7 flex items-center justify-between py-4">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="font-display text-[22px] tracking-wider">{meta.siteName || 'KALAAKAARI'}</span>
          <span className="font-deva text-[13px] text-ink-mute">{meta.siteNameDeva || 'कलाकारी'}</span>
        </Link>

        <div className="hidden md:flex gap-9 items-center">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative text-[12px] tracking-[.18em] uppercase transition-colors duration-300 ${
                  isActive ? 'text-ink' : 'text-ink-mute hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <Link
          to={cta.to}
          className="hidden md:inline-flex px-4 py-2.5 border border-line text-[11px] tracking-[.18em] uppercase hover:bg-saffron hover:border-saffron hover:text-bg transition-colors duration-300"
        >
          {cta.label}
        </Link>

        <button
          className="md:hidden text-[11px] tracking-[.24em] uppercase px-3 py-2 border border-line"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-bg-2 px-7 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-[14px] tracking-[.18em] uppercase text-ink-mute"
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
