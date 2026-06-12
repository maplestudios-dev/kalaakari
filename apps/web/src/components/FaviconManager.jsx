import { useEffect } from 'react'
import { useCopy } from '../lib/copy.jsx'

/**
 * Watches meta.favicon in the JSON copy and swaps the <link rel="icon"> at runtime.
 * If meta.favicon is empty, leaves the bundled /favicon.svg in place.
 */
export default function FaviconManager() {
  const url = useCopy('meta.favicon')
  const themeColor = useCopy('meta.themeColor')

  useEffect(() => {
    if (url) setFavicon(url)
    // No "else" — when blank, the bundled /favicon.svg from index.html stays active.
  }, [url])

  useEffect(() => {
    if (!themeColor) return
    let tag = document.querySelector('meta[name="theme-color"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'theme-color')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', themeColor)
  }, [themeColor])

  return null
}

function setFavicon(href) {
  // Detect a few sensible mime types
  const ext = (href.split('.').pop() || '').toLowerCase()
  const type =
    ext === 'svg'  ? 'image/svg+xml' :
    ext === 'png'  ? 'image/png' :
    ext === 'ico'  ? 'image/x-icon' :
    ext === 'webp' ? 'image/webp' :
    'image/png'

  // Replace any existing icon links so iconset doesn't show stale entries
  document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((el) => el.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = type
  link.href = href
  document.head.appendChild(link)

  const apple = document.createElement('link')
  apple.rel = 'apple-touch-icon'
  apple.href = href
  document.head.appendChild(apple)
}
