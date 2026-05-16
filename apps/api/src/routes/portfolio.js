import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Portfolio from '../models/Portfolio.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

// PUBLIC: list
r.get('/', asyncHandler(async (req, res) => {
  const { category, featured } = req.query
  const q = { published: true }
  if (category) q.category = category
  if (featured) q.featured = featured === 'true'
  const items = await Portfolio.find(q).sort({ order: 1, createdAt: -1 }).limit(60)
  res.json({ items })
}))

// PUBLIC: by slug
r.get('/:slug', asyncHandler(async (req, res) => {
  const item = await Portfolio.findOne({ slug: req.params.slug, published: true })
  if (!item) { res.status(404); throw new Error('Project not found') }
  res.json({ item })
}))

// AUTHED: create
r.post('/', requireAuth, requirePermission('portfolio.write'), asyncHandler(async (req, res) => {
  // authors can create drafts but can't publish
  const body = { ...req.body }
  if (req.user.role === 'Author') body.published = false
  const item = await Portfolio.create(body)
  await audit({ req, action: 'create', resource: 'portfolio', resourceId: String(item._id), summary: `Created project "${item.title}"` })
  res.status(201).json({ item })
}))

// AUTHED: update
r.put('/:id', requireAuth, requirePermission('portfolio.write'), asyncHandler(async (req, res) => {
  const before = await Portfolio.findById(req.params.id).lean()
  if (!before) { res.status(404); throw new Error('Project not found') }
  const body = { ...req.body }
  // publishing requires elevated permission
  if (body.published && !req.user.role.match(/Owner|Admin|Editor/)) delete body.published
  const item = await Portfolio.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
  await audit({ req, action: 'update', resource: 'portfolio', resourceId: String(item._id), summary: `Updated "${item.title}"`, before, after: item.toObject() })
  res.json({ item })
}))

// AUTHED: delete
r.delete('/:id', requireAuth, requirePermission('portfolio.delete'), asyncHandler(async (req, res) => {
  const item = await Portfolio.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Project not found') }
  await audit({ req, action: 'delete', resource: 'portfolio', resourceId: String(item._id), summary: `Deleted "${item.title}"` })
  res.json({ ok: true })
}))

export default r
