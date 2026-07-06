import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

/**
 * Renders a CMS-hosted custom HTML page (e.g. a proposal) at /<slug>.
 * The stored HTML is a full, standalone document, so it's rendered in a
 * full-viewport iframe (via srcDoc) — isolated from the site's styles/scripts
 * and covering the site chrome for a clean standalone page.
 */
export default function CustomPage() {
  const { slug } = useParams()
  const [state, setState] = useState({ status: 'loading', html: '' })

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) { setState({ status: 'notfound' }); return }
    setState({ status: 'loading' })
    axios.get(`${api}/pages/${encodeURIComponent(slug)}`)
      .then((r) => setState({ status: 'ok', html: r.data?.item?.html || '' }))
      .catch(() => setState({ status: 'notfound' }))
  }, [slug])

  if (state.status === 'loading') {
    return <div className="pt-44 pb-24 max-w-[1320px] mx-auto px-7 text-ink-mute label-tag">Loading…</div>
  }

  if (state.status === 'notfound') {
    return (
      <div className="pt-44 pb-32 max-w-[1320px] mx-auto px-7">
        <div className="label-tag">404 · Not found</div>
        <h1 className="font-display text-6xl mt-3 break-words">Nothing at this URL.</h1>
        <p className="font-serif-i text-ink-mute mt-4 text-xl">The page may have been unpublished, or the address is wrong.</p>
        <Link to="/" className="inline-block mt-8 px-6 py-3 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg">Back home →</Link>
      </div>
    )
  }

  return (
    <iframe
      title="Kalaakaari page"
      srcDoc={state.html}
      className="fixed inset-0 w-full h-full border-0 z-[200] bg-white"
      sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-downloads"
    />
  )
}
