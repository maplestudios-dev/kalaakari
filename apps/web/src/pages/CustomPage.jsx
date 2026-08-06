import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

/**
 * Renders a CMS-hosted custom HTML page (e.g. a proposal) at /<slug>.
 *
 * The iframe points straight at the API endpoint rather than being handed a
 * srcDoc string: the document streams in and renders progressively, so a large
 * proposal starts appearing immediately instead of showing "Loading…" until the
 * last byte lands. A HEAD request runs first so an unknown or unpublished slug
 * still gets the site's own 404 rather than a broken frame.
 *
 * Because the frame's origin is the API host and not this site, the sandbox's
 * allow-same-origin no longer grants the document access to this origin's
 * storage the way it did when the markup was inlined via srcDoc.
 */
export default function CustomPage() {
  const { slug } = useParams()
  const [state, setState] = useState({ status: 'loading', src: '' })

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) { setState({ status: 'notfound', src: '' }); return }
    const src = `${api}/pages/${encodeURIComponent(slug)}`
    setState({ status: 'loading', src: '' })
    let cancelled = false
    axios.head(src)
      .then(() => !cancelled && setState({ status: 'ok', src }))
      .catch(() => !cancelled && setState({ status: 'notfound', src: '' }))
    return () => { cancelled = true }
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
      src={state.src}
      className="fixed inset-0 w-full h-full border-0 z-[200] bg-white"
      sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-downloads"
    />
  )
}
