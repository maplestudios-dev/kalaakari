import { Router } from 'express'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'
import asyncHandler from 'express-async-handler'
import Page from '../models/Page.js'
import { requireAuth } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'
import {
  MAX_HTML_BYTES, PAGES_DIR, PAGES_REL,
  resolvePagePath, readPageHtml, deletePageHtml, mb
} from '../lib/pageStore.js'

// Slugs owned by the React app — a custom page must not shadow these.
const RESERVED = new Set([
  '', 'about', 'work', 'reel', 'journal', 'careers', 'press',
  'recommendations', 'contact', 'services', 'admin', 'api'
])

// Above this, the CMS stops loading markup into its textarea — a 40 MB string
// in a <textarea> locks up the browser. Larger pages are replaced by re-upload.
export const INLINE_EDIT_MAX_BYTES = 2 * 1024 * 1024

const slugify = (s = '') => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Straight to disk — never through memory, which is the whole point of the move.
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, PAGES_DIR),
    filename:    (req, file, cb) => cb(null, `${crypto.randomBytes(12).toString('hex')}.html`)
  }),
  // +1 is deliberate: busboy trips its limit on `fileSize === fileSizeLimit`,
  // so passing MAX_HTML_BYTES here would reject a file of exactly that size.
  // One byte higher makes the advertised 50 MB limit genuinely inclusive.
  limits: { fileSize: MAX_HTML_BYTES + 1, files: 1 }
})

// multer reports its own failures with codes, not HTTP statuses.
function uploadHtml(req, res, next) {
  upload.single('html')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413)
      return next(new Error(
        `That page is over the ${mb(MAX_HTML_BYTES)} limit. ` +
        'Move large inlined images to the media library and reference them by URL.'
      ))
    }
    next(err)
  })
}

const relPathOf = (file) => path.posix.join(PAGES_REL, path.basename(file.path))

/** Discard a just-uploaded file when validation rejects the request. */
async function discard(req) {
  if (req.file) await deletePageHtml(relPathOf(req.file))
}

const publicShape = (p) => ({
  _id: p._id, title: p.title, slug: p.slug,
  bytes: p.bytes, published: p.published,
  createdAt: p.createdAt, updatedAt: p.updatedAt
})

const r = Router()

// AUTHED: list for the CMS. Metadata only — the markup lives on disk and a list
// view has no use for it.
r.get('/', requireAuth, asyncHandler(async (req, res) => {
  const items = await Page.find({}).sort({ updatedAt: -1 })
  res.json({ items: items.map(publicShape) })
}))

// AUTHED: one page for the editor. Markup is included only when it is small
// enough to edit inline; past that the CMS offers re-upload instead.
r.get('/id/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Page.findById(req.params.id)
  if (!item) { res.status(404); throw new Error('Page not found') }
  const editableInline = item.bytes <= INLINE_EDIT_MAX_BYTES
  res.json({
    item: publicShape(item),
    editableInline,
    inlineEditMaxBytes: INLINE_EDIT_MAX_BYTES,
    html: editableInline ? await readPageHtml(item.htmlPath) : null
  })
}))

// PUBLIC: stream a published page's markup as text/html. Streaming rather than
// JSON-wrapping means the browser renders it progressively and neither side
// ever holds the whole document in memory.
r.get('/:slug', asyncHandler(async (req, res) => {
  const item = await Page.findOne({ slug: req.params.slug.toLowerCase(), published: true })
  if (!item) { res.status(404); throw new Error('Page not found') }
  const abs = resolvePagePath(item.htmlPath)
  if (!abs) { res.status(404); throw new Error('Page content is missing') }
  // maxAge 0 + ETag: always revalidate, but a 304 when the page hasn't changed.
  res.sendFile(abs, { maxAge: 0, etag: true, lastModified: true }, (err) => {
    if (err && !res.headersSent) { res.status(404).json({ error: 'Page content is missing' }) }
  })
}))

// AUTHED: create
r.post('/', requireAuth, uploadHtml, asyncHandler(async (req, res) => {
  const slug = slugify(req.body.slug || req.body.title || '')
  if (!slug)               { await discard(req); res.status(400); throw new Error('A title or slug is required') }
  if (RESERVED.has(slug))  { await discard(req); res.status(400); throw new Error(`"${slug}" is a reserved path — pick another slug`) }
  if (!req.file)           { res.status(400); throw new Error('No HTML uploaded — send the markup as multipart field "html"') }
  if (await Page.findOne({ slug })) {
    await discard(req); res.status(409); throw new Error(`Slug "${slug}" is already in use`)
  }

  const item = await Page.create({
    title:     req.body.title,
    slug,
    htmlPath:  relPathOf(req.file),
    bytes:     req.file.size,
    published: req.body.published !== 'false'
  })
  await audit({ req, action: 'create', resource: 'page', resourceId: String(item._id), summary: `Created page "${item.title}" (/${item.slug}, ${mb(item.bytes)})` })
  res.status(201).json({ item: publicShape(item) })
}))

// AUTHED: update. A new file replaces the old one; omitting the file edits
// metadata only and leaves the stored markup untouched.
r.put('/:id', requireAuth, uploadHtml, asyncHandler(async (req, res) => {
  const item = await Page.findById(req.params.id)
  if (!item) { await discard(req); res.status(404); throw new Error('Page not found') }

  // Only an explicitly supplied slug moves a page's URL. Re-deriving it from a
  // changed title — as this route used to — silently breaks links that have
  // already been sent to a client.
  if (typeof req.body.slug === 'string' && req.body.slug.trim()) {
    const slug = slugify(req.body.slug)
    if (!slug)              { await discard(req); res.status(400); throw new Error('A title or slug is required') }
    if (RESERVED.has(slug)) { await discard(req); res.status(400); throw new Error(`"${slug}" is a reserved path — pick another slug`) }
    const clash = await Page.findOne({ slug, _id: { $ne: item._id } })
    if (clash) { await discard(req); res.status(409); throw new Error(`Slug "${slug}" is already in use`) }
    item.slug = slug
  }
  if (req.body.title != null)     item.title = req.body.title
  if (req.body.published != null) item.published = req.body.published !== 'false'

  const previousPath = item.htmlPath
  if (req.file) {
    item.htmlPath = relPathOf(req.file)
    item.bytes    = req.file.size
  }

  await item.save()
  // Only after the document commits — otherwise a failed save would leave the
  // page pointing at a file we already deleted.
  if (req.file && previousPath && previousPath !== item.htmlPath) await deletePageHtml(previousPath)

  await audit({ req, action: 'update', resource: 'page', resourceId: String(item._id), summary: `Updated page "${item.title}" (/${item.slug}, ${mb(item.bytes)})` })
  res.json({ item: publicShape(item) })
}))

// AUTHED: delete
r.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Page.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Page not found') }
  await deletePageHtml(item.htmlPath)
  await audit({ req, action: 'delete', resource: 'page', resourceId: String(item._id), summary: `Deleted page "${item.title}"` })
  res.json({ ok: true })
}))

export default r
