import { useEffect, useState } from 'react'
import { contact } from '../lib/api.js'

export default function Submissions() {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(null)
  const refresh = () => contact.list().then(setItems)
  useEffect(() => { refresh() }, [])

  const exportUrl = (import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000/api') + '/contact/export.csv'

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Leads</div>
          <h1 className="font-display text-5xl mt-2">Contact submissions</h1>
        </div>
        <a href={exportUrl} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg">Export CSV ↓</a>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">When</th>
              <th className="p-4">Name / Brand</th>
              <th className="p-4">Email</th>
              <th className="p-4">Service</th>
              <th className="p-4">Budget</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className={`border-b border-line ${!c.read ? 'bg-bg' : ''}`}>
                <td className="p-4 text-ink-mute label-tag normal-case tracking-[.1em] text-[11px]">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="p-4">{c.name}<span className="block text-ink-mute text-xs">{c.brand}</span></td>
                <td className="p-4 text-ink-mute">{c.email}</td>
                <td className="p-4">{c.service}</td>
                <td className="p-4">{c.budget}</td>
                <td className="p-4">{c.read ? <span className="label-tag">Read</span> : <span className="label-tag text-saffron">Unread</span>}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setOpen(c)} className="text-saffron hover:underline">view</button>
                  <button onClick={async () => { await contact.patch(c._id, { read: !c.read }); refresh() }} className="text-ink-mute hover:text-ink">
                    {c.read ? 'mark unread' : 'mark read'}
                  </button>
                  <button onClick={async () => { if (confirm('Delete?')) { await contact.remove(c._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="p-10 text-center label-tag text-ink-mute">No submissions yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setOpen(null)}>
          <div className="bg-bg-2 border border-line p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl">{open.name}</h2>
                <span className="label-tag">{open.brand} · {open.service} · {open.budget} · {open.timeline}</span>
              </div>
              <button onClick={() => setOpen(null)} className="text-ink-mute hover:text-saffron">close ×</button>
            </div>
            <p className="text-ink-mute mb-2"><span className="label-tag">Email:</span> {open.email}</p>
            {open.phone && <p className="text-ink-mute mb-4"><span className="label-tag">Phone:</span> {open.phone}</p>}
            <div className="border-t border-line pt-4 whitespace-pre-wrap leading-relaxed">{open.message}</div>
          </div>
        </div>
      )}
    </>
  )
}
