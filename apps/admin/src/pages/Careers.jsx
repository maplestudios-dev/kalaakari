import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { careers } from '../lib/api.js'

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']

export default function CareersPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => careers.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Careers</div>
          <h1 className="font-display text-5xl mt-2">Job postings</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Roles shown at <code className="text-mustard">/careers</code>. Unpublished posts stay hidden from the public site.</p>
        </div>
        <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Add role</button>
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Role</th>
              <th className="p-4">Department</th>
              <th className="p-4">Location</th>
              <th className="p-4">Type</th>
              <th className="p-4">Live</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((j) => (
              <tr key={j._id} className="border-b border-line">
                <td className="p-4">{j.role}</td>
                <td className="p-4 text-ink-mute">{j.department}</td>
                <td className="p-4 text-ink-mute">{j.location}</td>
                <td className="p-4"><span className="label-tag text-mustard">{j.type}</span></td>
                <td className="p-4">{j.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setEditing(j)} className="text-saffron hover:underline">edit</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await careers.remove(j._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="p-10 text-center label-tag text-ink-mute">No roles yet. Click + Add role.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: isNew
      ? { type: 'Full-time', location: 'New Delhi', published: true, applyEmail: 'careers@kalaakaari.in' }
      : { ...initial, requirementsRaw: (initial.requirements || []).join('\n') }
  })

  const submit = async (data) => {
    const { requirementsRaw, ...payload } = data
    payload.requirements = (requirementsRaw || '')
      .split('\n').map((s) => s.trim()).filter(Boolean)
    if (isNew) await careers.create(payload)
    else       await careers.update(initial._id, payload)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-2xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'Add role' : 'Edit role'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Role title" className="md:col-span-2"><input {...register('role', { required: true })} className={I} placeholder="Senior Brand Designer" /></F>
          <F label="Department"><input {...register('department')} className={I} placeholder="Design" /></F>
          <F label="Location"><input {...register('location')} className={I} placeholder="New Delhi · Hybrid" /></F>
          <F label="Type"><select {...register('type')} className={I}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></F>
          <F label="Apply email"><input {...register('applyEmail')} className={I} placeholder="careers@kalaakaari.in" /></F>
          <F label="Description" className="md:col-span-2"><textarea rows={3} {...register('description')} className={I} placeholder="What the role is about…" /></F>
          <F label="Requirements (one per line)" className="md:col-span-2"><textarea rows={5} {...register('requirementsRaw')} className={I} placeholder={'5+ years in brand identity\nA reel of identity systems\nComfortable owning a client conversation'} /></F>
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
