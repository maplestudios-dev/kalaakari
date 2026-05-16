import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { users, can } from '../lib/api.js'

const ROLES = ['Owner','Admin','Editor','Author','Viewer']

export default function UsersPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [invited, setInvited] = useState(null)
  const refresh = () => users.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Team</div>
          <h1 className="font-display text-5xl mt-2">Team & roles</h1>
        </div>
        {can('users.invite') && (
          <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Invite teammate</button>
        )}
      </header>

      {invited && (
        <div className="border border-saffron bg-bg-2 p-6 mb-8">
          <div className="label-tag text-saffron mb-2">Invite sent</div>
          <p className="text-sm">Share this URL with <span className="text-ink">{invited.email}</span> — it expires in 7 days.</p>
          <code className="block mt-3 p-3 bg-bg border border-line text-mustard text-xs break-all">{invited.acceptUrl}</code>
          <button onClick={() => setInvited(null)} className="mt-4 text-xs label-tag tracking-[.16em] hover:text-ink">dismiss</button>
        </div>
      )}

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Name / Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last login</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className="border-b border-line">
                <td className="p-4">{u.name}<span className="block text-ink-mute text-xs">{u.email}</span></td>
                <td className="p-4"><span className="px-2 py-1 border border-mustard text-mustard text-[10px] tracking-[.18em] uppercase">{u.role}</span></td>
                <td className="p-4">
                  {u.status === 'active'    && <span className="text-ink-mute label-tag">Active</span>}
                  {u.status === 'pending'   && <span className="text-mustard label-tag">Pending</span>}
                  {u.status === 'suspended' && <span className="text-saffron label-tag">Suspended</span>}
                </td>
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}</td>
                <td className="p-4 text-right space-x-3">
                  {can('users.changeRole') && u.role !== 'Owner' && <button onClick={() => setEditing(u)} className="text-saffron hover:underline">edit</button>}
                  {can('users.suspend') && u.role !== 'Owner' && (
                    <button onClick={async () => { await users.suspend(u._id); refresh() }} className="text-ink-mute hover:text-ink">
                      {u.status === 'suspended' ? 'unsuspend' : 'suspend'}
                    </button>
                  )}
                  {can('users.changeRole') && (
                    <button onClick={async () => {
                      if (!confirm('Reset password? Will invalidate current password and issue a new accept-invite token.')) return
                      const r = await users.resetPassword(u._id); setInvited({ email: u.email, acceptUrl: r.acceptUrl }); refresh()
                    }} className="text-ink-mute hover:text-saffron">reset pw</button>
                  )}
                  {can('users.delete') && u.role !== 'Owner' && (
                    <button onClick={async () => { if (confirm('Delete user?')) { await users.remove(u._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className="p-10 text-center label-tag text-ink-mute">No users yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Drawer
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={(r) => { refresh(); setEditing(null); if (r?.acceptUrl) setInvited({ email: r.user.email, acceptUrl: r.acceptUrl }) }}
        />
      )}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: isNew ? { role: 'Viewer' } : initial })
  const submit = async (data) => {
    if (isNew) {
      const r = await users.invite(data); onSaved(r)
    } else {
      const user = await users.update(initial._id, data); onSaved({ user })
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md border border-line bg-bg-2 p-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'Invite teammate' : 'Edit user'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>
        <F label="Name"><input {...register('name', { required: true })} className={I} /></F>
        {isNew && <F label="Email" className="mt-4"><input type="email" {...register('email', { required: true })} className={I} /></F>}
        <F label="Role" className="mt-4">
          <select {...register('role', { required: true })} className={I}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </F>
        <p className="label-tag mt-4 text-[10px] normal-case tracking-[.08em] text-ink-mute leading-relaxed">
          <strong className="text-ink tracking-[.18em]">Roles:</strong>&nbsp;
          Owner = everything · Admin = manage all but user delete · Editor = full content + publish · Author = draft only · Viewer = read-only.
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase">Cancel</button>
          <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">
            {isSubmitting ? 'Saving…' : (isNew ? 'Send invite →' : 'Save →')}
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
