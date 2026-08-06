import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { pages } from '../lib/api.js'

const slugify = (s = '') => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Keep in sync with MAX_HTML_BYTES in apps/api/src/lib/pageStore.js
const MAX_HTML_BYTES = 50 * 1024 * 1024
const byteLen = (s = '') => new TextEncoder().encode(s).length
const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`)
const TOO_BIG_HINT = 'Move large inlined images to the media library and reference them by URL.'

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
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Host standalone HTML pages (proposals, landing pages) at a custom URL — e.g. <code className="text-mustard">kalaakaari.in/free-period-dps</code>. Upload an HTML file or paste the markup — up to {fmtSize(MAX_HTML_BYTES)} per page.</p>
        </div>
        <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ New page</button>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">URL</th>
              <th className="p-4">Size</th>
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
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px] text-ink-mute">{fmtSize(p.bytes || 0)}</td>
                <td className="p-4">{p.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px]">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setEditing(p)} className="text-saffron hover:underline">edit</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await pages.remove(p._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="p-10 text-center label-tag text-ink-mute">No custom pages yet.</td></tr>}
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
  const [loading, setLoading] = useState(!isNew)
  // A File chosen in the picker is passed through untouched — reading a 50 MB
  // document into a string just to hand it back to FormData would defeat the
  // streaming upload entirely.
  const [pendingFile, setPendingFile] = useState(null)
  const [editableInline, setEditableInline] = useState(true)
  const [storedBytes, setStoredBytes] = useState(initial.bytes || 0)

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { title: initial.title || '', slug: initial.slug || '', published: initial.published ?? true, html: '' }
  })

  // The list carries metadata only, so the markup for an inline edit has to be
  // fetched when the drawer opens.
  useEffect(() => {
    if (isNew) return
    let cancelled = false
    pages.get(initial._id)
      .then((d) => {
        if (cancelled) return
        setEditableInline(d.editableInline)
        setStoredBytes(d.item.bytes || 0)
        reset({ title: d.item.title, slug: d.item.slug, published: d.item.published, html: d.html || '' })
      })
      .catch((e) => !cancelled && setErr(e.response?.data?.error || e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [initial._id, isNew, reset])

  const title = watch('title')
  const slug = watch('slug')
  const html = watch('html')

  const currentBytes = pendingFile ? pendingFile.size : (editableInline ? byteLen(html || '') : storedBytes)
  const overLimit = currentBytes > MAX_HTML_BYTES

  const onFile = (file) => {
    if (!file) return
    if (file.size > MAX_HTML_BYTES) {
      setErr(`"${file.name}" is ${fmtSize(file.size)} — the maximum is ${fmtSize(MAX_HTML_BYTES)}. ${TOO_BIG_HINT}`)
      return
    }
    setErr(null)
    setPendingFile(file)
    // Small files stay editable in the textarea; large ones are upload-only.
    if (file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader()
      reader.onload = () => { setValue('html', String(reader.result || ''), { shouldDirty: true }); setEditableInline(true) }
      reader.readAsText(file)
    } else {
      setValue('html', '', { shouldDirty: false })
      setEditableInline(false)
    }
  }

  const submit = async (data) => {
    setErr(null)
    const payload = { title: data.title, slug: slugify(data.slug || data.title || ''), published: !!data.published }

    if (pendingFile)          payload.html = pendingFile
    else if (editableInline)  payload.html = data.html || ''
    // else: no new file and the stored markup was too large to load — leave it
    // untouched and update the metadata only.

    if (isNew && !pendingFile && !(data.html || '').trim()) {
      setErr('Add some HTML — paste it below or upload a file.')
      return
    }
    if (payload.html !== undefined) {
      const bytes = pendingFile ? pendingFile.size : byteLen(payload.html)
      if (bytes > MAX_HTML_BYTES) {
        setErr(`Page HTML is ${fmtSize(bytes)} — the maximum is ${fmtSize(MAX_HTML_BYTES)}. ${TOO_BIG_HINT}`)
        return
      }
    }

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

        {loading ? (
          <p className="label-tag text-ink-mute py-10 text-center">Loading page…</p>
        ) : (
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
                  {currentBytes > 0 && (
                    <span className={`label-tag text-[10px] normal-case tracking-[.08em] ${overLimit ? 'text-saffron' : 'text-mustard'}`}>
                      {fmtSize(currentBytes)} {overLimit ? `— over the ${fmtSize(MAX_HTML_BYTES)} limit` : `of ${fmtSize(MAX_HTML_BYTES)}`}
                    </span>
                  )}
                  <input ref={fileRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1.5 border border-line text-[11px] tracking-[.18em] uppercase hover:bg-ink hover:text-bg">Upload .html</button>
                </div>
              </div>

              {editableInline ? (
                <textarea {...register('html')} rows={12} className={`${I} font-mono text-xs`} placeholder="Paste full HTML here, or upload a file above…" />
              ) : (
                <div className="border border-line p-5 text-sm text-ink-mute">
                  {pendingFile
                    ? <>Ready to upload <span className="text-mustard">{pendingFile.name}</span> ({fmtSize(pendingFile.size)}). It replaces the current markup when you save.</>
                    : <>This page is {fmtSize(storedBytes)} — too large to edit in the browser. Upload a replacement file to change it, or edit the title, slug, and published state here and save.</>}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2"><input type="checkbox" {...register('published')} /> <span className="label-tag">Published</span></label>

            {err && <p className="text-sm text-saffron">{err}</p>}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase">Cancel</button>
          <button disabled={isSubmitting || overLimit || loading} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard disabled:opacity-40 disabled:hover:bg-saffron">{isSubmitting ? 'Saving…' : 'Save →'}</button>
        </div>
      </form>
    </div>
  )
}

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}
