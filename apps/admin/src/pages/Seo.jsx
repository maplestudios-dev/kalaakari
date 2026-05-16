import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { seo, can } from '../lib/api.js'

export default function SeoPage() {
  const [tab, setTab] = useState('entries')

  return (
    <>
      <header className="mb-8">
        <div className="label-tag">CMS · SEO</div>
        <h1 className="font-display text-5xl mt-2">SEO management</h1>
        <p className="text-ink-mute text-sm mt-2 max-w-2xl">
          Per-path meta + JSON-LD overrides and a 301 redirect manager. Public XML sitemap auto-generates from your published content at <code className="text-mustard">/sitemap.xml</code>.
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        <TabBtn active={tab === 'entries'}   onClick={() => setTab('entries')}>Entries</TabBtn>
        <TabBtn active={tab === 'redirects'} onClick={() => setTab('redirects')}>Redirects</TabBtn>
        <TabBtn active={tab === 'tools'}     onClick={() => setTab('tools')}>Tools</TabBtn>
      </div>

      {tab === 'entries'   && <Entries />}
      {tab === 'redirects' && <Redirects />}
      {tab === 'tools'     && <Tools />}
    </>
  )
}

function TabBtn({ active, ...rest }) {
  return <button {...rest} className={`px-4 py-2 border text-[11px] tracking-[.24em] uppercase transition-colors ${active ? 'bg-saffron text-bg border-saffron' : 'border-line text-ink-mute hover:text-ink'}`} />
}

// ─── ENTRIES ───────────────────────────────
function Entries() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => seo.entries().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <div className="flex justify-end mb-4">
        {can('seo.write') && <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ New entry</button>}
      </div>
      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Path</th>
              <th className="p-4">Title</th>
              <th className="p-4">Description</th>
              <th className="p-4">Indexed?</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e._id} className="border-b border-line">
                <td className="p-4 font-mono text-mustard">{e.path}</td>
                <td className="p-4">{e.title || <span className="text-ink-mute">—</span>}</td>
                <td className="p-4 text-ink-mute truncate max-w-md">{e.description || '—'}</td>
                <td className="p-4">{e.noindex ? <span className="label-tag text-saffron">noindex</span> : <span className="label-tag">index</span>}</td>
                <td className="p-4 text-right space-x-3">
                  {can('seo.write') && <button onClick={() => setEditing(e)} className="text-saffron hover:underline">edit</button>}
                  {can('seo.write') && <button onClick={async () => { if (confirm('Delete entry?')) { await seo.removeEntry(e._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className="p-10 text-center label-tag text-ink-mute">No SEO overrides yet. Pages fall back to defaults from site copy.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <EntryDrawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function EntryDrawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: isNew
      ? { path: '/', twitterCard: 'summary_large_image' }
      : { ...initial, schemaJSONLDStr: initial.schemaJSONLD ? JSON.stringify(initial.schemaJSONLD, null, 2) : '' }
  })
  const [jsonErr, setJsonErr] = useState(null)

  const submit = async (data) => {
    setJsonErr(null)
    const { schemaJSONLDStr, ...payload } = data
    if (schemaJSONLDStr) {
      try { payload.schemaJSONLD = JSON.parse(schemaJSONLDStr) } catch (e) { setJsonErr(e.message); return }
    } else {
      payload.schemaJSONLD = null
    }
    await seo.saveEntry(payload)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-2xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'New SEO entry' : 'Edit SEO entry'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Path (e.g. / or /work/aroha-jewels)" className="md:col-span-2"><input {...register('path', { required: true })} className={I} placeholder="/work/aroha-jewels" /></F>
          <F label="Title" className="md:col-span-2"><input {...register('title')} className={I} placeholder="Aroha — KALAAKAARI" /></F>
          <F label="Description" className="md:col-span-2"><textarea rows={2} {...register('description')} className={I} placeholder="155-char meta description ideal." /></F>
          <F label="Canonical URL"><input {...register('canonical')} className={I} placeholder="https://kalaakaari.in/work/aroha" /></F>
          <F label="Twitter card">
            <select {...register('twitterCard')} className={I}>
              <option value="summary_large_image">summary_large_image</option>
              <option value="summary">summary</option>
            </select>
          </F>
          <F label="OG image URL" className="md:col-span-2"><input {...register('ogImage')} className={I} /></F>
          <F label="OG title (overrides title)"><input {...register('ogTitle')} className={I} /></F>
          <F label="OG description (overrides description)"><input {...register('ogDescription')} className={I} /></F>
          <F label="JSON-LD (raw JSON object)" className="md:col-span-2">
            <textarea rows={8} {...register('schemaJSONLDStr')} className={`${I} font-mono text-xs`} placeholder='{"@context":"https://schema.org","@type":"CreativeWork","name":"Aroha"}' />
            {jsonErr && <span className="text-saffron text-xs mt-1 block">JSON error: {jsonErr}</span>}
          </F>
          <label className="flex items-center gap-2 mt-2 md:col-span-2"><input type="checkbox" {...register('noindex')} /> <span className="label-tag">noindex, nofollow</span></label>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase">Cancel</button>
          <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">{isSubmitting ? 'Saving…' : 'Save →'}</button>
        </div>
      </form>
    </div>
  )
}

// ─── REDIRECTS ────────────────────────────────
function Redirects() {
  const [items, setItems] = useState([])
  const [adding, setAdding] = useState(false)
  const refresh = () => seo.redirects().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <div className="flex justify-end mb-4">
        {can('seo.write') && <button onClick={() => setAdding(true)} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Add redirect</button>}
      </div>
      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">From</th>
              <th className="p-4">To</th>
              <th className="p-4">Code</th>
              <th className="p-4">Note</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id} className="border-b border-line">
                <td className="p-4 font-mono text-mustard">{r.from}</td>
                <td className="p-4 font-mono text-ink-mute">→ {r.to}</td>
                <td className="p-4">{r.code}</td>
                <td className="p-4 text-ink-mute">{r.note}</td>
                <td className="p-4 text-right">
                  {can('seo.write') && <button onClick={async () => { if (confirm('Delete?')) { await seo.removeRedirect(r._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className="p-10 text-center label-tag text-ink-mute">No redirects.</td></tr>}
          </tbody>
        </table>
      </div>
      {adding && <RedirectDrawer onClose={() => setAdding(false)} onSaved={() => { refresh(); setAdding(false) }} />}
    </>
  )
}

function RedirectDrawer({ onClose, onSaved }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { code: 301 } })
  const submit = async (data) => { await seo.addRedirect(data); onSaved() }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md border border-line bg-bg-2 p-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">New redirect</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <F label="From (path)"><input {...register('from', { required: true })} className={I} placeholder="/old-work" /></F>
        <F label="To (path or absolute URL)" className="mt-4"><input {...register('to', { required: true })} className={I} placeholder="/work" /></F>
        <F label="Code" className="mt-4">
          <select {...register('code', { valueAsNumber: true })} className={I}>
            <option value={301}>301 — permanent</option>
            <option value={302}>302 — temporary</option>
            <option value={307}>307 — temporary (preserve method)</option>
            <option value={308}>308 — permanent (preserve method)</option>
          </select>
        </F>
        <F label="Note (optional)" className="mt-4"><input {...register('note')} className={I} /></F>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase">Cancel</button>
          <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">{isSubmitting ? 'Saving…' : 'Save →'}</button>
        </div>
      </form>
    </div>
  )
}

// ─── TOOLS ────────────────────────────────────
function Tools() {
  const apiBase = (import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '')
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <ToolCard title="Sitemap XML" desc="Auto-generated from every published portfolio project, blog post, video and SEO entry." href={`${apiBase}/sitemap.xml`} />
      <ToolCard title="Robots.txt" desc="References the sitemap and allows all paths by default." href={`${apiBase}/robots.txt`} />
    </div>
  )
}
function ToolCard({ title, desc, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block border border-line bg-bg-2 p-6 hover:border-saffron transition-colors">
      <div className="font-display text-2xl">{title}</div>
      <p className="text-ink-mute text-sm mt-2">{desc}</p>
      <div className="label-tag mt-4 text-mustard">{href} ↗</div>
    </a>
  )
}

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}
