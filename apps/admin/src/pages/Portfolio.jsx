import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { portfolio } from '../lib/api.js'

const CATS = ['Branding','Campaign','Content','Digital','Performance','Production','Film','Social','Packaging','Identity']

export default function PortfolioPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)  // null = none; {} = new

  const refresh = () => portfolio.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Portfolio</div>
          <h1 className="font-display text-5xl mt-2">Projects</h1>
        </div>
        <button onClick={() => setEditing({})} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ New project</button>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Year</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Published</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-line">
                <td className="p-4">{p.title}<span className="block label-tag text-[10px] mt-1">{p.slug}</span></td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">{p.year}</td>
                <td className="p-4">{p.featured ? '★' : '—'}</td>
                <td className="p-4">{p.published ? 'Live' : 'Draft'}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setEditing(p)} className="text-saffron hover:underline">edit</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await portfolio.remove(p._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="p-10 text-center label-tag text-ink-mute">No projects yet. Run <code>pnpm seed</code> or click + New project.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <EditDrawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function EditDrawer({ initial, onClose, onSaved }) {
  const isNew = !initial._id
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: initial })

  const submit = async (data) => {
    if (isNew) await portfolio.create(data)
    else await portfolio.update(initial._id, data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-2xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'New project' : 'Edit project'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Title"><input {...register('title', { required: true })} className={I} /></F>
          <F label="Slug"><input {...register('slug', { required: true })} className={I} placeholder="hauz-khas-collective" /></F>
          <F label="Client"><input {...register('client')} className={I} /></F>
          <F label="Hindi / Devanagari label"><input {...register('deva')} className={I} placeholder="हौज़ ख़ास" /></F>
          <F label="Category">
            <select {...register('category')} className={I}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </F>
          <F label="Year"><input type="number" {...register('year', { valueAsNumber: true })} className={I} /></F>
          <F label="Result tag (short)"><input {...register('result')} className={I} placeholder="4.2M Impressions" /></F>
          <F label="Industry"><input {...register('industry')} className={I} /></F>
          <F label="Cover URL" className="md:col-span-2"><input {...register('cover')} className={I} /></F>
          <F label="Excerpt" className="md:col-span-2"><textarea rows={2} {...register('excerpt')} className={I} /></F>
          <F label="Challenge" className="md:col-span-2"><textarea rows={3} {...register('challenge')} className={I} /></F>
          <F label="The thinking" className="md:col-span-2"><textarea rows={3} {...register('idea')} className={I} /></F>
          <F label="The execution" className="md:col-span-2"><textarea rows={3} {...register('execution')} className={I} /></F>
          <label className="flex items-center gap-2 mt-2"><input type="checkbox" {...register('featured')} /> <span className="label-tag">Featured</span></label>
          <label className="flex items-center gap-2 mt-2"><input type="checkbox" {...register('published')} defaultChecked={initial.published ?? true} /> <span className="label-tag">Published</span></label>
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
