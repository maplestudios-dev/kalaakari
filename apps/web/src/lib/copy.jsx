import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { defaultCopy } from './defaultCopy.js'

const CopyCtx = createContext({ copy: defaultCopy, ready: true, version: 0 })

/**
 * Mount once at the app root. Fetches /api/site-copy on boot; falls back to
 * the bundled defaults if the API is unreachable so the site always renders.
 */
export function CopyProvider({ children }) {
  const [copy, setCopy] = useState(defaultCopy)
  const [ready, setReady] = useState(true)         // we render immediately with defaults
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/site-copy`).then((r) => {
      if (r.data?.copy) {
        // merge over defaults so newly added fields don't blow up the UI
        setCopy(merge(defaultCopy, r.data.copy))
        setVersion(r.data.version || 1)
      }
    }).catch(() => {}).finally(() => setReady(true))
  }, [])

  const value = useMemo(() => ({ copy, ready, version }), [copy, ready, version])
  return <CopyCtx.Provider value={value}>{children}</CopyCtx.Provider>
}

/**
 * `useCopy('hero.title')` returns the value at that dot-path, or `undefined`.
 * `useCopy()` returns the whole tree.
 */
export function useCopy(path) {
  const { copy } = useContext(CopyCtx)
  if (!path) return copy
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), copy)
}

export function useCopyVersion() {
  return useContext(CopyCtx).version
}

// ── deep-merge: defaults beneath, overrides on top ──
function merge(a, b) {
  if (Array.isArray(b)) return b                    // arrays in overrides replace wholesale
  if (b && typeof b === 'object' && a && typeof a === 'object' && !Array.isArray(a)) {
    const out = { ...a }
    for (const k of Object.keys(b)) out[k] = merge(a[k], b[k])
    return out
  }
  return b !== undefined ? b : a
}
