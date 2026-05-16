import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Video from '../models/Video.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

r.get('/', asyncHandler(async (req, res) => {
  const { category, featured } = req.query
  const q = { published: true }
  if (category) q.category = category
  if (featured) q.featured = featured === 'true'
  const items = await Video.find(q).sort({ order: 1, createdAt: -1 })
  res.json({ items })
}))

r.get('/:slug', asyncHandler(async (req, res) => {
  const item = await Video.findOne({ slug: req.params.slug, published: true })
  if (!item) { res.status(404); throw new Error('Not found') }
  res.json({ item })
}))

r.post('/', requireAuth, requirePermission('video.write'), asyncHandler(async (req, res) => {
  const item = await Video.create(req.body)
  await audit({ req, action: 'create', resource: 'video', resourceId: String(item._id), summary: `Created video "${item.title}"` })
  res.status(201).json({ item })
}))

r.put('/:id', requireAuth, requirePermission('video.write'), asyncHandler(async (req, res) => {
  const item = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'update', resource: 'video', resourceId: String(item._id), summary: `Updated video "${item.title}"` })
  res.json({ item })
}))

r.delete('/:id', requireAuth, requirePermission('video.delete'), asyncHandler(async (req, res) => {
  const item = await Video.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'delete', resource: 'video', resourceId: String(item._id), summary: `Deleted video "${item.title}"` })
  res.json({ ok: true })
}))

export default r
