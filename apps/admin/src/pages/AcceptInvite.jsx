import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, meStore } from '../lib/api.js'

export default function AcceptInvite() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (password.length < 8) return setErr('Password must be at least 8 characters')
    if (password !== confirm) return setErr('Passwords do not match')
    try {
      await api.post('/users/accept-invite', { token, password })
      setDone(true)
      setTimeout(() => nav('/login'), 1200)
    } catch (e) { setErr(e.response?.data?.error || 'Could not accept invite') }
  }

  if (!token) return <div className="min-h-screen grid place-items-center text-ink-mute">Missing token.</div>

  return (
    <div className="min-h-screen grid place-items-center px-7">
      <form onSubmit={submit} className="w-full max-w-md border border-line bg-bg-2 p-10">
        <div className="font-display text-3xl">KALAAKAARI</div>
        <div className="font-deva text-mustard text-sm">कलाकारी · Set your password</div>

        {done ? (
          <p className="text-mustard mt-9">All set. Redirecting to sign-in…</p>
        ) : (
          <>
            <label className="block mt-9 label-tag">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-saffron" />
            <label className="block mt-6 label-tag">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-saffron" />
            {err && <p className="text-saffron text-sm mt-5">{err}</p>}
            <button className="mt-9 w-full py-4 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">Activate account →</button>
          </>
        )}
      </form>
    </div>
  )
}
