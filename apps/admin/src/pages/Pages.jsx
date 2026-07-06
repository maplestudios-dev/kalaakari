import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { pages } from '../lib/api.js'

const slugify = (s = '') => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function PagesPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => pages.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Custom pages</div>
          <h1 className="font-display text-5xl mt-2">Pages</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Host standalone HTML pages (proposals, landing pages) at a custom URL — e.g. <code className="text-mustard">kalaakaari.in/free-period-dps</code>. Upload an HTML file or paste the markup.</p>
        </div>
        <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ New page</button>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">URL</th>
              <th className="p-4">Live</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-line">
                <td className="p-4">{p.title}</td>
                <td className="p-4"><a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-mustard hover:underline">/{p.slug}</a></td>
                <td className="p-4">{p.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px]">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setEditing(p)} className="text-saffron hover:underline">edit</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await pages.remove(p._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className="p-10 text-center label-tag text-ink-mute">No custom pages yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const fileRef = useRef(null)
  const [err, setErr] = useState(null)
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: isNew ? { published: true, html: '' } : { ...initial }
  })

  const title = watch('title')
  const slug = watch('slug')
  const html = watch('html')

  const onFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setValue('html', String(reader.result || ''), { shouldDirty: true })
    reader.readAsText(file)
  }

  const submit = async (data) => {
    setErr(null)
    const payload = { ...data, slug: slugify(data.slug || data.title || '') }
    try {
      if (isNew) await pages.create(payload)
      else       await pages.update(initial._id, payload)
      onSaved()
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }

  const effectiveSlug = slugify(slug || title || '')

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-3xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'New page' : `Edit ${initial.title}`}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>

        <div className="space-y-4">
          <F label="Title"><input {...register('title', { required: true })} className={I} placeholder="Free Period DPS" /></F>
          <F label="Slug (URL)">
            <input {...register('slug')} className={I} placeholder="free-period-dps" />
            <span className="block label-tag text-[10px] mt-1.5 normal-case tracking-[.08em] text-ink-mute">Leave blank to derive from the title. Page will be live at <span className="text-mustard">kalaakaari.in/{effectiveSlug || '…'}</span></span>
          </F>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="label-tag">HTML content</span>
              <div className="flex items-center gap-3">
                {html && <span className="label-tag text-[10px] text-mustard normal-case tracking-[.08em]">{(html.length / 1024).toFixed(1)} KB loaded</span>}
                <input ref={fileRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1.5 border border-line text-[11px] tracking-[.18em] uppercase hover:bg-ink hover:text-bg">Upload .html</button>
              </div>
            </div>
            <textarea {...register('html')} rows={12} className={`${I} font-mono text-xs`} placeholder="Paste full HTML here, or upload a file above…" />
          </div>

          <label className="flex items-center gap-2"><input type="checkbox" {...register('published')} defaultChecked={initial.published ?? true} /> <span className="label-tag">Published</span></label>

          {err && <p className="text-sm text-saffron">{err}</p>}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase">Cancel</button>
          <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">{isSubmitting ? 'Saving…' : 'Save →'}</button>
        </div>
      </form>
    </div>
  )
}

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}
