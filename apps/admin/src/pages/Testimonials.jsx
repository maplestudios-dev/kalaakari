import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { testimonials, can } from '../lib/api.js'

export default function TestimonialsPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => testimonials.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Testimonials</div>
          <h1 className="font-display text-5xl mt-2">Client voice</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Quotes from clients. Featured ones rotate on the homepage carousel.</p>
        </div>
        {can('testimonials.write') && (
          <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Add testimonial</button>
        )}
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {items.map((t) => (
          <div key={t._id} className="border border-line bg-bg-2 p-6 relative">
            <span className="absolute top-4 right-4 label-tag">{t.featured ? <span className="text-mustard">★ Featured</span> : ''}</span>
            <p className="font-serif-i text-lg leading-relaxed">"{t.quote}"</p>
            <div className="mt-4 flex items-center gap-3">
              {t.avatar ? <img src={t.avatar} className="w-10 h-10 rounded-full object-cover border border-line" alt="" /> : <div className="w-10 h-10 rounded-full bg-bg border border-line" />}
              <div>
                <div className="text-ink">{t.author}</div>
                <div className="label-tag text-[10px] tracking-[.16em]">{t.role}{t.role && t.company && ' · '}{t.company}</div>
              </div>
            </div>
            <div className="mt-5 flex gap-4 text-xs label-tag">
              {can('testimonials.write') && <button onClick={() => setEditing(t)} className="text-saffron hover:underline">edit</button>}
              {can('testimonials.write') && <button onClick={async () => { if (confirm('Delete?')) { await testimonials.remove(t._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>}
              <span className={`ml-auto ${t.published ? 'text-ink-mute' : 'text-saffron'}`}>{t.published ? 'Live' : 'Draft'}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="md:col-span-2 label-tag text-ink-mute text-center p-10 border border-line">No testimonials yet.</p>}
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: isNew ? { rating: 5, published: true } : initial
  })
  const submit = async (data) => {
    if (data.rating) data.rating = +data.rating
    if (isNew) await testimonials.create(data)
    else       await testimonials.update(initial._id, data)
    onSaved()
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-2xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'Add testimonial' : 'Edit testimonial'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Quote" className="md:col-span-2"><textarea rows={4} {...register('quote', { required: true })} className={I} placeholder="They sharpened the brief before they touched a Figma file…" /></F>
          <F label="Author"><input {...register('author', { required: true })} className={I} placeholder="Mira Kapoor" /></F>
          <F label="Role"><input {...register('role')} className={I} placeholder="Founder" /></F>
          <F label="Company"><input {...register('company')} className={I} placeholder="Aroha Jewels" /></F>
          <F label="Rating (1-5)">
            <select {...register('rating')} className={I}>
              <option value="">—</option>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </F>
          <F label="Avatar URL" className="md:col-span-2"><input {...register('avatar')} className={I} placeholder="https://…" /></F>
          <F label="Video URL (optional)" className="md:col-span-2"><input {...register('videoUrl')} className={I} placeholder="https://…/video.mp4 or YouTube URL" /></F>
          <F label="Order"><input type="number" {...register('order', { valueAsNumber: true })} className={I} /></F>
          <div className="flex flex-col gap-2 mt-7">
            <label className="flex items-center gap-2"><input type="checkbox" {...register('featured')} /> <span className="label-tag">Featured (homepage rotation)</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('published')} defaultChecked={initial.published ?? true} /> <span className="label-tag">Published</span></label>
          </div>
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
