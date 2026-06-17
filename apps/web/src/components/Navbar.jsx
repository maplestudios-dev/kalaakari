import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCopy } from '../lib/copy.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [egg, setEgg] = useState(false)
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
        <div className="flex items-center gap-3">
          {/* Easter-egg entry point — opens the KALAA + KAARI breakdown */}
          <button
            onClick={() => setEgg(true)}
            aria-label="What does Kalaakaari mean?"
            title="What does Kalaakaari mean?"
            className="w-7 h-7 shrink-0 grid place-items-center border border-line rounded-full font-deva text-mustard text-sm hover:border-saffron hover:text-saffron transition-colors"
          >
            क
          </button>
          <Link to="/" className="font-display text-[22px] tracking-wider">{meta.siteName || 'KALAAKAARI'}</Link>
          <button type="button" onClick={() => setEgg(true)} className="font-deva text-[13px] text-ink-mute hover:text-mustard transition-colors">{meta.siteNameDeva || 'कलाकारी'}</button>
        </div>

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

      {egg && <LogoEasterEgg onClose={() => setEgg(false)} />}
    </nav>
  )
}

function LogoEasterEgg({ onClose }) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm grid place-items-center p-6" onClick={onClose}>
      <div className="w-full max-w-md border border-line bg-bg-2 p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-ink-mute hover:text-saffron text-sm">✕</button>

        <div className="font-display text-4xl tracking-wider">
          KALAA<span className="text-saffron">KAARI</span>
        </div>
        <div className="font-deva text-3xl text-mustard mt-1">कलाकारी</div>
        <div className="label-tag text-ink-mute mt-3">Kalaakaari · noun · Hindi</div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mt-7 border border-line p-5">
          <div>
            <div className="font-deva text-2xl text-ink">कला</div>
            <div className="label-tag text-saffron mt-1">KALAA</div>
            <div className="text-ink-mute text-[12px] mt-1.5 leading-relaxed">Art · Craft · Skill</div>
          </div>
          <div className="font-display text-2xl text-ink-mute">+</div>
          <div>
            <div className="font-deva text-2xl text-ink">कारी</div>
            <div className="label-tag text-saffron mt-1">KAARI</div>
            <div className="text-ink-mute text-[12px] mt-1.5 leading-relaxed">Maker · Creator · Doer</div>
          </div>
        </div>

        <p className="font-serif-i text-ink-mute mt-6 leading-relaxed text-[15px]">
          We are the <span className="text-mustard">kalaakaars</span> — artists, makers, and storytellers of India's digital age. Where the ancient craft of <span className="text-mustard">kalaa</span> meets the velocity of modern advertising.
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          {['विज्ञापन', 'Ad Work', 'कला', 'Fine Craft', 'नई दिल्ली', 'New Delhi'].map((t) => (
            <span key={t} className="px-3 py-1.5 border border-line rounded-full text-[10px] tracking-[.16em] uppercase text-ink-mute">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
