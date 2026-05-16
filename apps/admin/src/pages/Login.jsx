import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, meStore } from '../lib/api.js'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@kalaakaari.in')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      const { token, user, rolePermissions } = await auth.login(email, password)
      localStorage.setItem('kalaakaari_token', token)
      meStore.set(user, rolePermissions)
      nav('/')
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center px-7">
      <form onSubmit={submit} className="w-full max-w-md border border-line bg-bg-2 p-10">
        <div className="font-display text-3xl">KALAAKAARI</div>
        <div className="font-deva text-mustard text-sm">कलाकारी · Studio admin</div>

        <label className="block mt-9 label-tag">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-saffron" required />

        <label className="block mt-6 label-tag">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-saffron" required />

        {err && <p className="text-saffron text-sm mt-5">{err}</p>}

        <button disabled={loading} className="mt-9 w-full py-4 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard transition-colors disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>

        <p className="label-tag text-center mt-6 text-[10px] normal-case tracking-[.1em] text-ink-mute">
          Default seed: <span className="text-ink">admin@kalaakaari.in</span> / <span className="text-ink">ChangeMe123!</span>
        </p>
      </form>
    </div>
  )
}
