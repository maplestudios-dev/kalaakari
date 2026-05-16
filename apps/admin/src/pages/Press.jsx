import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { press, can } from '../lib/api.js'

const TYPES = ['Award','Press','Feature']

export default function PressPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => press.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Press & Awards</div>
          <h1 className="font-display text-5xl mt-2">Press & awards</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Logos, mentions, awards. Sorted by date.</p>
        </div>
        {can('press.write') && (
          <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Add entry</button>
        )}
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Type</th>
              <th className="p-4">Title</th>
              <th className="p-4">Publication</th>
              <th className="p-4">Date</th>
              <th className="p-4">Live</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-line">
                <td className="p-4"><span className="label-tag text-mustard">{p.type}</span></td>
                <td className="p-4">{p.title}</td>
                <td className="p-4 text-ink-mute">{p.publication}</td>
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px]">{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
                <td className="p-4">{p.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 text-right space-x-3">
                  {can('press.write') && <button onClick={() => setEditing(p)} className="text-saffron hover:underline">edit</button>}
                  {can('press.write') && <button onClick={async () => { if (confirm('Delete?')) { await press.remove(p._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="p-10 text-center label-tag text-ink-mute">No press entries yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const initDate = initial.date ? new Date(initial.date).toISOString().slice(0, 10) : ''
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: isNew ? { type: 'Press', published: true } : { ...initial, date: initDate }
  })
  const submit = async (data) => {
    if (data.date) data.date = new Date(data.date)
    if (isNew) await press.create(data)
    else       await press.update(initial._id, data)
    onSaved()
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-2xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'Add press entry' : 'Edit press entry'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Type"><select {...register('type')} className={I}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></F>
          <F label="Date"><input type="date" {...register('date')} className={I} /></F>
          <F label="Title" className="md:col-span-2"><input {...register('title', { required: true })} className={I} placeholder="Brand Identity of the Year — Hauz Khas Collective" /></F>
          <F label="Publication / Award body"><input {...register('publication')} className={I} placeholder="Kyoorius Design Awards" /></F>
          <F label="External URL"><input {...register('url')} className={I} placeholder="https://…" /></F>
          <F label="Excerpt" className="md:col-span-2"><textarea rows={3} {...register('excerpt')} className={I} /></F>
          <F label="Logo URL"><input {...register('logo')} className={I} /></F>
          <F label="Image URL"><input {...register('image')} className={I} /></F>
          <F label="Order"><input type="number" {...register('order', { valueAsNumber: true })} className={I} /></F>
          <label className="flex items-center gap-2 mt-7"><input type="checkbox" {...register('published')} defaultChecked={initial.published ?? true} /> <span className="label-tag">Published</span></label>
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
