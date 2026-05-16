import { useEffect, useState } from 'react'
import { audit } from '../lib/api.js'

const RESOURCES = ['', 'portfolio', 'blog', 'leads', 'copy', 'users', 'seo', 'video', 'testimonials', 'press']
const ACTIONS   = ['', 'create','update','delete','publish','login','invite','role-change','suspend','restore','export']

export default function AuditPage() {
  const [items, setItems] = useState([])
  const [resource, setResource] = useState('')
  const [action, setAction] = useState('')

  const load = () => audit.list({ resource: resource || undefined, action: action || undefined }).then(setItems)
  useEffect(() => { load() }, [resource, action])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Audit Log</div>
          <h1 className="font-display text-5xl mt-2">Who did what</h1>
        </div>
        <div className="flex gap-2">
          <Select value={resource} onChange={setResource} options={RESOURCES} placeholder="All resources" />
          <Select value={action} onChange={setAction} options={ACTIONS} placeholder="All actions" />
        </div>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">When</th>
              <th className="p-4">Who</th>
              <th className="p-4">Action</th>
              <th className="p-4">Resource</th>
              <th className="p-4">Summary</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e._id} className="border-b border-line">
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px] text-ink-mute whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="p-4">{e.actorName || e.actor?.email || '—'}<span className="block text-ink-mute text-xs">{e.actor?.role}</span></td>
                <td className="p-4"><span className="label-tag text-mustard">{e.action}</span></td>
                <td className="p-4 text-ink-mute">{e.resource}{e.resourceId ? <span className="block text-[10px]">{e.resourceId}</span> : null}</td>
                <td className="p-4">{e.summary}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className="p-10 text-center label-tag text-ink-mute">No audit entries.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent border border-line px-3 py-2 text-[12px] tracking-[.18em] uppercase">
      <option value="">{placeholder}</option>
      {options.filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
