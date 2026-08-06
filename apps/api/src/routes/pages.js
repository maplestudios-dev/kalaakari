import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Page from '../models/Page.js'
import { requireAuth } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

// Slugs owned by the React app — a custom page must not shadow these.
const RESERVED = new Set([
  '', 'about', 'work', 'reel', 'journal', 'careers', 'press',
  'recommendations', 'contact', 'services', 'admin', 'api'
])

// A page's HTML lives inline in its Mongo document, so BSON's 16 MB per-document
// ceiling is the hard wall. Cap the HTML itself well under that, and let the JSON
// body run larger still — escaping quotes and newlines inflates the wire payload
// past the size of the markup it carries. (nginx allows 25 MB, so both fit.)
export const MAX_HTML_BYTES = 15 * 1024 * 1024
export const PAGE_JSON_LIMIT = '20mb'

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

function assertHtmlFits(html) {
  if (html == null) return
  const bytes = Buffer.byteLength(String(html), 'utf8')
  if (bytes <= MAX_HTML_BYTES) return
  const e = new Error(
    `Page HTML is ${mb(bytes)} — the maximum is ${mb(MAX_HTML_BYTES)}. ` +
    'Upload large inlined images to the media library and reference them by URL instead.'
  )
  e.status = 413
  throw e
}

const slugify = (s = '') => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function normalize(body) {
  const out = { ...body }
  if (out.slug != null || out.title != null) {
    out.slug = slugify(out.slug || out.title || '')
  }
  return out
}

const r = Router()

// PUBLIC: fetch a published page by slug (full HTML)
r.get('/:slug', asyncHandler(async (req, res) => {
  const item = await Page.findOne({ slug: req.params.slug.toLowerCase(), published: true })
  if (!item) { res.status(404); throw new Error('Page not found') }
  res.json({ item })
}))

// AUTHED: list all incl. drafts — for the CMS
r.get('/', requireAuth, asyncHandler(async (req, res) => {
  const items = await Page.find({}).sort({ updatedAt: -1 })
  res.json({ items })
}))

// AUTHED: create
r.post('/', requireAuth, asyncHandler(async (req, res) => {
  const body = normalize(req.body)
  if (!body.slug) { res.status(400); throw new Error('A title or slug is required') }
  if (RESERVED.has(body.slug)) { res.status(400); throw new Error(`"${body.slug}" is a reserved path — pick another slug`) }
  assertHtmlFits(body.html)
  const exists = await Page.findOne({ slug: body.slug })
  if (exists) { res.status(409); throw new Error(`Slug "${body.slug}" is already in use`) }
  const item = await Page.create(body)
  await audit({ req, action: 'create', resource: 'page', resourceId: String(item._id), summary: `Created page "${item.title}" (/${item.slug})` })
  res.status(201).json({ item })
}))

// AUTHED: update
r.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const body = normalize(req.body)
  if (body.slug && RESERVED.has(body.slug)) { res.status(400); throw new Error(`"${body.slug}" is a reserved path — pick another slug`) }
  assertHtmlFits(body.html)
  if (body.slug) {
    const clash = await Page.findOne({ slug: body.slug, _id: { $ne: req.params.id } })
    if (clash) { res.status(409); throw new Error(`Slug "${body.slug}" is already in use`) }
  }
  const item = await Page.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
  if (!item) { res.status(404); throw new Error('Page not found') }
  await audit({ req, action: 'update', resource: 'page', resourceId: String(item._id), summary: `Updated page "${item.title}" (/${item.slug})` })
  res.json({ item })
}))

// AUTHED: delete
r.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Page.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Page not found') }
  await audit({ req, action: 'delete', resource: 'page', resourceId: String(item._id), summary: `Deleted page "${item.title}"` })
  res.json({ ok: true })
}))

export default r
