import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { SeoEntry, Redirect } from '../models/SeoEntry.js'
import Portfolio from '../models/Portfolio.js'
import BlogPost from '../models/BlogPost.js'
import Video from '../models/Video.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

// PUBLIC — fetch SEO for a path
r.get('/path', asyncHandler(async (req, res) => {
  const path = (req.query.path || '/').toLowerCase()
  const entry = await SeoEntry.findOne({ path })
  res.json({ entry })
}))

// PUBLIC — sitemap.xml
r.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const origin = req.query.origin || (req.headers.host ? `https://${req.headers.host}` : '')
  const [portfolio, blog, videos, custom] = await Promise.all([
    Portfolio.find({ published: true }, 'slug updatedAt').lean(),
    BlogPost.find({ published: true }, 'slug updatedAt').lean(),
    Video.find({ published: true }, 'slug updatedAt').lean(),
    SeoEntry.find({}, 'path updatedAt').lean()
  ])

  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/work', priority: '0.9' },
    { loc: '/services', priority: '0.8' },
    { loc: '/about', priority: '0.7' },
    { loc: '/reel', priority: '0.8' },
    { loc: '/contact', priority: '0.6' },
    ...portfolio.map((p) => ({ loc: `/work/${p.slug}`, lastmod: p.updatedAt, priority: '0.7' })),
    ...blog.map((p) => ({ loc: `/journal/${p.slug}`, lastmod: p.updatedAt, priority: '0.5' })),
    ...videos.map((v) => ({ loc: `/reel/${v.slug}`, lastmod: v.updatedAt, priority: '0.6' })),
    ...custom.filter((e) => !urls?.some((u) => u.loc === e.path)).map((e) => ({ loc: e.path, lastmod: e.updatedAt, priority: '0.4' }))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${origin}${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n') +
    `\n</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.send(xml)
}))

// PUBLIC — robots.txt
r.get('/robots.txt', asyncHandler(async (req, res) => {
  const origin = req.query.origin || (req.headers.host ? `https://${req.headers.host}` : '')
  res.setHeader('Content-Type', 'text/plain')
  res.send(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
}))

// PUBLIC — redirects (the web edge or a thin proxy reads this)
r.get('/redirects', asyncHandler(async (req, res) => {
  const items = await Redirect.find().sort({ createdAt: -1 }).limit(500)
  res.json({ items })
}))

// AUTHED CRUD for SeoEntry
r.get('/entries', requireAuth, requirePermission('seo.read'), asyncHandler(async (req, res) => {
  const items = await SeoEntry.find().sort({ path: 1 })
  res.json({ items })
}))

r.put('/entries', requireAuth, requirePermission('seo.write'), asyncHandler(async (req, res) => {
  const { path, ...data } = req.body || {}
  if (!path) { res.status(400); throw new Error('path required') }
  const item = await SeoEntry.findOneAndUpdate(
    { path: path.toLowerCase() },
    { ...data, path: path.toLowerCase(), updatedByName: req.user.name },
    { upsert: true, new: true, runValidators: true }
  )
  await audit({ req, action: 'update', resource: 'seo', resourceId: path, summary: `SEO updated for ${path}` })
  res.json({ item })
}))

r.delete('/entries/:id', requireAuth, requirePermission('seo.write'), asyncHandler(async (req, res) => {
  const item = await SeoEntry.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'delete', resource: 'seo', resourceId: item.path, summary: `SEO removed for ${item.path}` })
  res.json({ ok: true })
}))

// AUTHED CRUD for Redirect
r.get('/redirects/all', requireAuth, requirePermission('seo.read'), asyncHandler(async (req, res) => {
  const items = await Redirect.find().sort({ createdAt: -1 })
  res.json({ items })
}))

r.post('/redirects', requireAuth, requirePermission('seo.write'), asyncHandler(async (req, res) => {
  const item = await Redirect.create({ ...req.body, from: req.body.from?.toLowerCase() })
  await audit({ req, action: 'create', resource: 'seo', summary: `Redirect ${item.from} → ${item.to}` })
  res.status(201).json({ item })
}))

r.delete('/redirects/:id', requireAuth, requirePermission('seo.write'), asyncHandler(async (req, res) => {
  const item = await Redirect.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'delete', resource: 'seo', summary: `Redirect removed: ${item.from}` })
  res.json({ ok: true })
}))

export default r
