import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { meStore, can } from '../lib/api.js'

const linkDefs = [
  { to: '/',             label: 'Dashboard',     perm: null },
  { to: '/homepage',     label: 'Homepage',      perm: 'copy.read' },
  { to: '/portfolio',    label: 'Portfolio',     perm: 'portfolio.read' },
  { to: '/video',        label: 'Videos',        perm: 'video.read' },
  { to: '/categories',   label: 'Categories',    perm: 'portfolio.read' },
  { to: '/blog',         label: 'Journal',       perm: 'blog.read' },
  { to: '/careers',      label: 'Careers',       perm: 'blog.read' },
  { to: '/recommendations', label: 'Recommendations', perm: 'blog.read' },
  { to: '/testimonials', label: 'Testimonials',  perm: 'testimonials.write' },
  { to: '/press',        label: 'Press',         perm: 'press.write' },
  { to: '/submissions',  label: 'Leads',         perm: 'leads.read' },
  { to: '/copy',         label: 'Site Copy',     perm: 'copy.read' },
  { to: '/seo',          label: 'SEO',           perm: 'seo.read' },
  { to: '/users',        label: 'Team',          perm: 'users.read' },
  { to: '/audit',        label: 'Audit Log',     perm: 'audit.read' }
]

export default function Shell() {
  const nav = useNavigate()
  const session = meStore.get()
  const me = session?.me

  const logout = () => { localStorage.removeItem('kalaakaari_token'); meStore.clear(); nav('/login') }
  const links = linkDefs.filter((l) => !l.perm || can(l.perm))

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <aside className="border-r border-line bg-bg-2 p-6 flex flex-col">
        <div className="flex items-baseline gap-2 mb-10">
          <span className="font-display text-2xl">KALAAKAARI</span>
          <span className="font-deva text-mustard text-sm">कलाकारी</span>
        </div>
        <div className="label-tag mb-3">Studio CMS</div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to} to={l.to} end
              className={({ isActive }) =>
                `px-3 py-2.5 text-sm tracking-[.16em] uppercase border border-transparent transition-colors ${
                  isActive ? 'bg-saffron text-bg border-saffron' : 'text-ink-mute hover:text-ink hover:border-line'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        {me && (
          <div className="mt-auto pt-6 border-t border-line">
            <div className="text-xs text-ink-mute leading-tight">
              <div className="text-ink truncate">{me.name}</div>
              <div className="text-[10px] mt-0.5">{me.email}</div>
              <div className="text-[10px] text-mustard mt-1 tracking-[.18em] uppercase">{me.role}</div>
            </div>
            <button onClick={logout} className="mt-4 text-left text-xs tracking-[.16em] uppercase text-ink-mute hover:text-saffron">
              Sign out ↗
            </button>
          </div>
        )}
      </aside>
      <main className="p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}
