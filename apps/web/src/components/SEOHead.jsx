import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { useCopy } from '../lib/copy.jsx'

/**
 * Lightweight head manager — no react-helmet dep. Reads /api/seo/path on
 * every route change and patches <title> + meta tags directly.
 */
export default function SEOHead({ overrides }) {
  const { pathname } = useLocation()
  const meta = useCopy('meta') || {}

  useEffect(() => {
    let cancelled = false
    async function run() {
      let entry = null
      const api = import.meta.env.VITE_API_URL
      if (api && !overrides) {
        try {
          const r = await axios.get(`${api}/seo/path`, { params: { path: pathname } })
          entry = r.data?.entry
        } catch {}
      }
      if (cancelled) return
      const data = { ...entry, ...overrides }
      const title = data.title || `${meta.siteName || 'KALAAKAARI'} · ${meta.tagline || ''}`
      const description = data.description || meta.tagline || ''
      const ogImage = data.ogImage || meta.defaultOgImage || ''

      document.title = title
      setMeta('description', description)
      setMeta('og:title', data.ogTitle || title, true)
      setMeta('og:description', data.ogDescription || description, true)
      setMeta('og:type', 'website', true)
      setMeta('og:url', window.location.href, true)
      if (ogImage) setMeta('og:image', ogImage, true)
      setMeta('twitter:card', data.twitterCard || 'summary_large_image')
      setLink('canonical', data.canonical || window.location.href)
      setMeta('robots', data.noindex ? 'noindex, nofollow' : 'index, follow')

      // JSON-LD
      let ld = document.querySelector('script[data-kalaakaari-ld]')
      if (data.schemaJSONLD) {
        if (!ld) {
          ld = document.createElement('script')
          ld.type = 'application/ld+json'
          ld.setAttribute('data-kalaakaari-ld', '')
          document.head.appendChild(ld)
        }
        ld.textContent = JSON.stringify(data.schemaJSONLD)
      } else if (ld) {
        ld.remove()
      }
    }
    run()
    return () => { cancelled = true }
  }, [pathname, overrides, meta])

  return null
}

function setMeta(name, content, isProperty) {
  const key = isProperty ? 'property' : 'name'
  let el = document.head.querySelector(`meta[${key}="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(key, name); document.head.appendChild(el) }
  el.setAttribute('content', content || '')
}
function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el) }
  el.setAttribute('href', href)
}
