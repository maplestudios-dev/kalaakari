import { Link } from 'react-router-dom'
import { useCopy } from '../lib/copy.jsx'

export default function Footer() {
  const f = useCopy('footer') || {}
  const meta = useCopy('meta') || {}
  const cols = f.columns || {}

  return (
    <footer className="border-t border-line bg-bg-2 pt-20 pb-10">
      <div className="max-w-[1320px] mx-auto px-7">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-14">
          <div>
            <div className="font-display text-5xl tracking-wider">{meta.siteName || 'KALAAKAARI'}</div>
            <div className="font-deva text-lg text-mustard mt-1">{meta.siteNameDeva || 'कलाकारी'}</div>
            <p className="text-ink-mute mt-5 max-w-sm leading-relaxed">{f.brandLine}</p>
          </div>

          {Object.entries(cols).map(([title, items]) => (
            <FootCol key={title} title={title} items={items} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-7 border-t border-line text-[11px] tracking-[.24em] uppercase text-ink-mute">
          <span>{f.copyright}</span>
          <div className="flex gap-6">
            {(f.legalLinks || []).map((l) => (
              <span key={l} className="hover:text-ink cursor-pointer">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function FootCol({ title, items = [] }) {
  return (
    <div>
      <h5 className="text-[11px] tracking-[.3em] uppercase text-saffron mb-5">{title}</h5>
      <ul className="space-y-2 text-sm text-ink-mute">
        {items.map((it, i) => (
          <li key={i} className="hover:text-ink transition-colors cursor-pointer">
            {typeof it === 'string'
              ? it
              : <Link to={it.to}>{it.label}</Link>}
          </li>
        ))}
      </ul>
    </div>
  )
}
