import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { auth, meStore } from '../lib/api.js'

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}

export default function SettingsPage() {
  const me = meStore.get?.() || {}
  const [msg, setMsg] = useState(null)
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm()

  const submit = async (data) => {
    setMsg(null)
    if (data.newPassword !== data.confirm) { setMsg({ error: 'New passwords do not match' }); return }
    try {
      await auth.changePassword(data.currentPassword, data.newPassword)
      setMsg({ ok: 'Password updated.' })
      reset()
    } catch (e) {
      setMsg({ error: e.response?.data?.error || e.message })
    }
  }

  return (
    <>
      <header className="mb-10">
        <div className="label-tag">CMS · Account</div>
        <h1 className="font-display text-5xl mt-2">Account settings</h1>
        {me?.email && <p className="text-ink-mute text-sm mt-2">Signed in as <span className="text-mustard">{me.email}</span>.</p>}
      </header>

      <form onSubmit={handleSubmit(submit)} className="max-w-md border border-line bg-bg-2 p-7 space-y-4">
        <h2 className="font-display text-2xl">Change password</h2>
        <F label="Current password"><input type="password" autoComplete="current-password" {...register('currentPassword', { required: true })} className={I} /></F>
        <F label="New password (min 8 characters)"><input type="password" autoComplete="new-password" {...register('newPassword', { required: true, minLength: 8 })} className={I} /></F>
        <F label="Confirm new password"><input type="password" autoComplete="new-password" {...register('confirm', { required: true })} className={I} /></F>

        {msg?.error && <p className="text-sm text-saffron">{msg.error}</p>}
        {msg?.ok && <p className="text-sm text-mustard">{msg.ok}</p>}

        <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">
          {isSubmitting ? 'Saving…' : 'Update password →'}
        </button>
      </form>
    </>
  )
}
