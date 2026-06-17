import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { blog, can } from '../lib/api.js'
import { useCategories } from '../lib/useCategories.js'

const CATS = ['Branding','Campaign Thinking','Cultural Strategy','Content & Social','Design','Advertising','Performance Creative','Studio Notes']

export default function BlogPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => blog.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Journal</div>
          <h1 className="font-display text-5xl mt-2">Journal posts</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">
            Notes, essays and studio dispatches. Published posts appear at <code className="text-mustard">/journal</code> on the public site.
          </p>
        </div>
        {can('blog.write') && (
          <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ New post</button>
        )}
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Author</th>
              <th className="p-4">Published</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-line">
                <td className="p-4">{p.title}<span className="block label-tag text-[10px] mt-1">/journal/{p.slug}</span></td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 text-ink-mute">{p.author}</td>
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px]">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}</td>
                <td className="p-4">{p.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 text-right space-x-3">
                  {can('blog.write') && <button onClick={() => setEditing(p)} className="text-saffron hover:underline">edit</button>}
                  {can('blog.delete') && <button onClick={async () => { if (confirm('Delete?')) { await blog.remove(p._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="p-10 text-center label-tag text-ink-mute">No posts yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const cats = useCategories('journal', CATS)
  const initPubDate = initial.publishedAt ? new Date(initial.publishedAt).toISOString().slice(0,10) : ''
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: isNew
      ? { category: 'Studio Notes', author: 'Kalaakaari Studio', published: false }
      : { ...initial, publishedAt: initPubDate, ...(initial.seo || {}) }
  })
  const canPublish = (() => { try { return JSON.parse(localStorage.getItem('kalaakaari_me')).me.role !== 'Author' } catch { return true } })()
  const willPublish = watch('published')

  const submit = async (data) => {
    const seo = { title: data.seoTitle, description: data.seoDescription, ogImage: data.seoOgImage }
    const payload = {
      title: data.title, slug: data.slug, category: data.category, author: data.author,
      excerpt: data.excerpt, body: data.body, cover: data.cover,
      published: !!data.published,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : (data.published ? new Date() : undefined),
      seo
    }
    if (isNew) await blog.create(payload)
    else       await blog.update(initial._id, payload)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-3xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'New post' : 'Edit post'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Title" className="md:col-span-2"><input {...register('title', { required: true })} className={I} /></F>
          <F label="Slug"><input {...register('slug', { required: true })} className={I} placeholder="naming-against-the-grain" /></F>
          <F label="Category"><select {...register('category')} className={I}>{cats.map((c) => <option key={c}>{c}</option>)}</select></F>
          <F label="Author"><input {...register('author')} className={I} /></F>
          <F label="Cover image URL"><input {...register('cover')} className={I} /></F>
          <F label="Excerpt (1-2 sentences)" className="md:col-span-2"><textarea rows={2} {...register('excerpt')} className={I} /></F>
          <F label="Body (plain text — paragraphs separated by blank lines, or HTML)" className="md:col-span-2">
            <textarea rows={14} {...register('body')} className={`${I} font-serif`} placeholder="Open with a hook…" />
          </F>

          <div className="md:col-span-2 mt-2 pt-6 border-t border-line">
            <div className="label-tag mb-3">SEO overrides (optional — falls back to title/excerpt/cover)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="SEO title"><input {...register('seoTitle')} className={I} /></F>
              <F label="OG image URL"><input {...register('seoOgImage')} className={I} /></F>
              <F label="SEO description" className="md:col-span-2"><textarea rows={2} {...register('seoDescription')} className={I} /></F>
            </div>
          </div>

          <div className="md:col-span-2 mt-2 pt-6 border-t border-line flex flex-wrap items-center gap-6">
            <F label="Publish date"><input type="date" {...register('publishedAt')} className={I} /></F>
            <label className="flex items-center gap-2 mt-7">
              <input type="checkbox" {...register('published')} disabled={!canPublish} />
              <span className="label-tag">{willPublish ? 'Published' : 'Draft'}</span>
              {!canPublish && <span className="text-[10px] text-ink-mute">(Author role — drafts only)</span>}
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase">Cancel</button>
          <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">
            {isSubmitting ? 'Saving…' : (isNew ? 'Create →' : 'Save →')}
          </button>
        </div>
      </form>
    </div>
  )
}

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}
