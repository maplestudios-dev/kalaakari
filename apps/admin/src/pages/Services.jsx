import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { services, portfolio, video } from '../lib/api.js'
import { useRowDrag, reorder } from '../lib/useRowDrag.js'

export default function ServicesPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => services.list().then(setItems)
  useEffect(() => { refresh() }, [])

  const { dragProps, overIndex } = useRowDrag((from, to) => {
    setItems((prev) => {
      const next = reorder(prev, from, to)
      services.reorder(next.map((s) => s._id)).catch(refresh)
      return next
    })
  })

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Services</div>
          <h1 className="font-display text-5xl mt-2">Services</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Edit each service's copy and attach the Work projects and Reel videos shown on its <code className="text-mustard">/services/&lt;slug&gt;</code> page. Drag the <span className="text-mustard">⠿</span> handle to reorder.</p>
        </div>
        <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Add service</button>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4 w-8"></th>
              <th className="p-4">Service</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Work</th>
              <th className="p-4">Videos</th>
              <th className="p-4">Live</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s, i) => (
              <tr key={s._id} {...dragProps(i)} className={`border-b border-line ${overIndex === i ? 'bg-saffron/10' : ''}`}>
                <td className="p-4 text-center text-ink-mute cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">⠿</td>
                <td className="p-4">{s.name}<span className="block font-deva text-mustard text-xs">{s.deva}</span></td>
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px]">{s.slug}</td>
                <td className="p-4 text-ink-mute">{s.workProjects?.length || 0}</td>
                <td className="p-4 text-ink-mute">{s.videos?.length || 0}</td>
                <td className="p-4">{s.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setEditing(s)} className="text-saffron hover:underline">edit</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await services.remove(s._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="p-10 text-center label-tag text-ink-mute">No services yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const [projects, setProjects] = useState([])
  const [videos, setVideos] = useState([])

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: isNew
      ? { published: true, workProjects: [], videos: [] }
      : {
          ...initial,
          capabilitiesRaw: (initial.capabilities || []).join('\n'),
          workProjects: (initial.workProjects || []).map(String),
          videos: (initial.videos || []).map(String)
        }
  })

  useEffect(() => {
    portfolio.list().then(setProjects).catch(() => {})
    video.list().then(setVideos).catch(() => {})
  }, [])

  const submit = async (data) => {
    const { capabilitiesRaw, ...payload } = data
    payload.capabilities = (capabilitiesRaw || '').split('\n').map((s) => s.trim()).filter(Boolean)
    payload.workProjects = data.workProjects || []
    payload.videos = data.videos || []
    if (isNew) await services.create(payload)
    else       await services.update(initial._id, payload)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-3xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'Add service' : `Edit ${initial.name}`}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Name"><input {...register('name', { required: true })} className={I} placeholder="Strategy" /></F>
          <F label="Slug (URL)"><input {...register('slug', { required: true })} className={I} placeholder="strategy" /></F>
          <F label="Hindi label"><input {...register('deva')} className={I} placeholder="रणनीति" /></F>
          <F label="Number"><input {...register('number')} className={I} placeholder="01" /></F>
          <F label="Description / about" className="md:col-span-2"><textarea rows={2} {...register('description')} className={I} /></F>
          <F label="Body (longer copy, optional)" className="md:col-span-2"><textarea rows={3} {...register('body')} className={I} /></F>
          <F label="Sub-capabilities (one per line)" className="md:col-span-2"><textarea rows={4} {...register('capabilitiesRaw')} className={I} placeholder={'Brand positioning\nArchitecture\nNarrative'} /></F>

          <Picker label="Attach Work projects" className="md:col-span-2" items={projects} register={register} name="workProjects" render={(p) => `${p.title}${p.client ? ` · ${p.client}` : ''}`} />
          <Picker label="Attach Reel videos" className="md:col-span-2" items={videos} register={register} name="videos" render={(v) => `${v.title}${v.client ? ` · ${v.client}` : ''}`} />

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

function Picker({ label, items, register, name, render, className = '' }) {
  return (
    <div className={className}>
      <span className="label-tag block mb-1.5">{label} <span className="text-ink-mute normal-case tracking-[.08em] text-[10px]">· {items.length} available</span></span>
      <div className="border border-line max-h-44 overflow-y-auto p-2 space-y-1 bg-bg/30">
        {items.length === 0 && <p className="label-tag text-ink-mute normal-case tracking-[.1em] p-2">Nothing to attach yet.</p>}
        {items.map((it) => (
          <label key={it._id} className="flex items-center gap-2 px-2 py-1 hover:bg-bg-2 cursor-pointer">
            <input type="checkbox" value={it._id} {...register(name)} />
            <span className="text-sm">{render(it)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}
