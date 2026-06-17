/**
 * Tolerant video source parsing.
 *
 * The CMS stores `youtubeId` / `vimeoId` as bare IDs, but editors frequently
 * paste a full share/watch URL. These helpers accept either a bare ID *or* any
 * common URL form and return what the embed players actually need, so a pasted
 * URL plays instead of producing a broken `…/embed/https://…` src.
 */

/** Extract a YouTube video ID from a bare ID or any common URL form. */
export function extractYouTubeId(input) {
  if (!input) return ''
  const raw = String(input).trim()
  // Already a bare 11-char ID.
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw
  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || ''
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v) return v
      // /embed/ID, /shorts/ID, /live/ID, /v/ID
      const parts = url.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p))
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
    }
  } catch {
    // Not a URL — fall through to a loose match.
  }
  const m = raw.match(/[A-Za-z0-9_-]{11}/)
  return m ? m[0] : ''
}

/** Extract a Vimeo video ID from a bare ID or any common URL form. */
export function extractVimeoId(input) {
  if (!input) return ''
  const raw = String(input).trim()
  if (/^\d+$/.test(raw)) return raw
  try {
    const url = new URL(raw)
    // vimeo.com/123456789, player.vimeo.com/video/123456789, /channels/x/123
    const nums = url.pathname.split('/').filter((p) => /^\d+$/.test(p))
    if (nums.length) return nums[nums.length - 1]
  } catch {
    /* fall through */
  }
  const m = raw.match(/\d{6,}/)
  return m ? m[0] : ''
}

/** True when the input is a YouTube Shorts URL (which are vertical 9:16). */
export function isYouTubeShorts(input) {
  if (!input) return false
  const raw = String(input).trim()
  try {
    const url = new URL(raw)
    return /(^|\.)youtube\.com$/.test(url.hostname.replace(/^www\./, '')) &&
      url.pathname.split('/').filter(Boolean)[0] === 'shorts'
  } catch {
    return /\/shorts\//.test(raw)
  }
}

/** Build a YouTube embed src, or '' if no ID could be parsed. */
export function youtubeEmbedSrc(input, { autoplay = true } = {}) {
  const id = extractYouTubeId(input)
  return id ? `https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1' : ''}` : ''
}

/** Build a Vimeo embed src, or '' if no ID could be parsed. */
export function vimeoEmbedSrc(input, { autoplay = true } = {}) {
  const id = extractVimeoId(input)
  return id ? `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1' : ''}` : ''
}
