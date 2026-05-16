import { useEffect, useState } from 'react'
import { portfolio, contact } from '../lib/api.js'

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, leads: 0, unread: 0, byService: {} })

  useEffect(() => {
    Promise.all([portfolio.list(), contact.list()]).then(([pl, cl]) => {
      const byService = cl.reduce((acc, c) => ((acc[c.service] = (acc[c.service] || 0) + 1), acc), {})
      setStats({ projects: pl.length, leads: cl.length, unread: cl.filter((c) => !c.read).length, byService })
    }).catch(() => {})
  }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">Overview</div>
          <h1 className="font-display text-5xl mt-2">Studio dashboard</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Stat label="Portfolio projects" v={stats.projects} />
        <Stat label="Total leads"       v={stats.leads} />
        <Stat label="Unread leads"      v={stats.unread} accent />
        <Stat label="Most-requested" v={Object.entries(stats.byService).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'} small />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
        <Panel title="Recent quick links">
          <Link href="/portfolio">→ Manage portfolio</Link>
          <Link href="/submissions">→ Review leads</Link>
          <Link href={(import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000/api') + '/contact/export.csv'}>→ Export leads as CSV</Link>
        </Panel>
        <Panel title="Lead breakdown by service">
          <ul className="space-y-2 text-sm">
            {Object.entries(stats.byService).map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-line py-2">
                <span className="text-ink-mute">{k}</span>
                <span className="font-display text-mustard">{v}</span>
              </li>
            ))}
            {Object.keys(stats.byService).length === 0 && <li className="text-ink-mute label-tag">No leads yet.</li>}
          </ul>
        </Panel>
      </div>
    </>
  )
}

function Stat({ label, v, accent, small }) {
  return (
    <div className={`border border-line p-6 bg-bg-2 ${accent ? 'border-saffron' : ''}`}>
      <div className="label-tag">{label}</div>
      <div className={`font-display mt-3 ${small ? 'text-2xl' : 'text-5xl'} ${accent ? 'text-saffron' : ''}`}>{v}</div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="border border-line p-6 bg-bg-2">
      <div className="label-tag mb-4">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Link({ href, children }) {
  return <a href={href} className="block text-sm text-ink-mute hover:text-saffron transition-colors">{children}</a>
}
