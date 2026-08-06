import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'

/**
 * On-disk storage for custom-page HTML.
 *
 * Page documents used to carry their markup inline, which capped a page at
 * BSON's 16 MB per-document limit. The markup now lives on disk and the Page
 * document keeps only a relative path, so the only real ceiling is MAX_HTML_BYTES.
 *
 * Files land in apps/api/uploads/pages/ alongside the media uploads, but they
 * are deliberately NOT reachable through the /uploads static mount — serving
 * them directly would bypass the `published` check and expose drafts. Reads go
 * through GET /api/pages/:slug, which streams the file after that check.
 */

export const MAX_HTML_BYTES = 50 * 1024 * 1024

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads')
export const PAGES_DIR = path.join(UPLOAD_ROOT, 'pages')
export const PAGES_REL = 'pages'

if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true })

export const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

/**
 * Resolve a stored relative path to an absolute one, refusing anything that
 * escapes PAGES_DIR — htmlPath comes out of the database, so a tampered or
 * malformed value must not be able to reach arbitrary files on disk.
 */
export function resolvePagePath(relPath) {
  if (!relPath) return null
  const abs = path.resolve(UPLOAD_ROOT, relPath)
  const within = path.relative(PAGES_DIR, abs)
  if (within.startsWith('..') || path.isAbsolute(within)) return null
  return abs
}

export async function pageHtmlSize(relPath) {
  const abs = resolvePagePath(relPath)
  if (!abs) return 0
  try {
    const st = await fsp.stat(abs)
    return st.size
  } catch {
    return 0
  }
}

export async function readPageHtml(relPath) {
  const abs = resolvePagePath(relPath)
  if (!abs) return ''
  try {
    return await fsp.readFile(abs, 'utf8')
  } catch {
    return ''
  }
}

/** Best-effort cleanup — a missing file must never fail the request. */
export async function deletePageHtml(relPath) {
  const abs = resolvePagePath(relPath)
  if (!abs) return
  try {
    await fsp.unlink(abs)
  } catch {
    /* already gone */
  }
}
