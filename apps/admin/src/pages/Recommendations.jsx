import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { recommendations } from '../lib/api.js'
import ImageUploader from '../components/ImageUploader.jsx'
import { useRowDrag, reorder } from '../lib/useRowDrag.js'

const TYPES = [
  { value: 'music', label: 'Music' },
  { value: 'movie', label: 'Movie' },
  { value: 'book',  label: 'Book' }
]

export default function RecommendationsPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => recommendations.list().then(setItems)
  useEffect(() => { refresh() }, [])

  const { dragProps, overIndex } = useRowDrag((from, to) => {
    setItems((prev) => {
      const next = reorder(prev, from, to)
      recommendations.reorder(next.map((x) => x._id)).catch(refresh)
      return next
    })
  })

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Recommendations</div>
          <h1 className="font-display text-5xl mt-2">Recommendations</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Music, movies, and books the team is into — shown at <code className="text-mustard">/recommendations</code>. Drag the <span className="text-mustard">⠿</span> handle to reorder.</p>
        </div>
        <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Add pick</button>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4 w-8"></th>
              <th className="p-4 w-16">Cover</th>
              <th className="p-4">Title</th>
              <th className="p-4">Creator</th>
              <th className="p-4">Type</th>
              <th className="p-4">Live</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x, i) => (
              <tr key={x._id} {...dragProps(i)} className={`border-b border-line ${overIndex === i ? 'bg-saffron/10' : ''}`}>
                <td className="p-4 text-center text-ink-mute cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">⠿</td>
                <td className="p-4">
                  {x.cover
                    ? <img src={x.cover} alt="" className="w-12 h-12 object-cover border border-line" loading="lazy" />
                    : <div className="w-12 h-12 grid place-items-center border border-line text-ink-mute text-[9px] uppercase bg-bg">none</div>}
                </td>
                <td className="p-4">{x.title}</td>
                <td className="p-4 text-ink-mute">{x.creator}</td>
                <td className="p-4"><span className="label-tag text-mustard capitalize">{x.type}</span></td>
                <td className="p-4">{x.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setEditing(x)} className="text-saffron hover:underline">edit</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await recommendations.remove(x._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="p-10 text-center label-tag text-ink-mute">No recommendations yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: isNew ? { type: 'music', published: true } : { ...initial }
  })

  const submit = async (data) => {
    if (isNew) await recommendations.create(data)
    else       await recommendations.update(initial._id, data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-2xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'Add recommendation' : 'Edit recommendation'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Type"><select {...register('type')} className={I}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></F>
          <F label="Creator (artist / director / author)"><input {...register('creator')} className={I} placeholder="A. R. Rahman" /></F>
          <F label="Title" className="md:col-span-2"><input {...register('title', { required: true })} className={I} placeholder="Title of the album / film / book" /></F>
          <ImageUploader
            className="md:col-span-2"
            label="Cover art / poster"
            field="cover"
            accept="image/*"
            aspectClass="w-28 h-28"
            register={register} setValue={setValue} watch={watch}
          />
          <F label="External link"><input {...register('link')} className={I} placeholder="https://open.spotify.com/…" /></F>
          <F label="Note (why we love it)" className="md:col-span-2"><textarea rows={3} {...register('note')} className={I} /></F>
          <label className="flex items-center gap-2 mt-2"><input type="checkbox" {...register('published')} defaultChecked={initial.published ?? true} /> <span className="label-tag">Published</span></label>
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
