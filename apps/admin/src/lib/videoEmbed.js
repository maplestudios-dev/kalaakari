/**
 * Extract bare video IDs from a pasted ID or full URL, so the CMS always
 * stores a clean `youtubeId` / `vimeoId` regardless of what the editor pastes.
 */

export function extractYouTubeId(input) {
  if (!input) return ''
  const raw = String(input).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw
  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || ''
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v) return v
      const parts = url.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p))
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
    }
  } catch {
    /* fall through */
  }
  const m = raw.match(/[A-Za-z0-9_-]{11}/)
  return m ? m[0] : raw
}

export function extractVimeoId(input) {
  if (!input) return ''
  const raw = String(input).trim()
  if (/^\d+$/.test(raw)) return raw
  try {
    const url = new URL(raw)
    const nums = url.pathname.split('/').filter((p) => /^\d+$/.test(p))
    if (nums.length) return nums[nums.length - 1]
  } catch {
    /* fall through */
  }
  const m = raw.match(/\d{6,}/)
  return m ? m[0] : raw
}
