import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Video from '../models/Video.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

r.get('/', asyncHandler(async (req, res) => {
  const { category, featured, project, projectSlug } = req.query
  const q = { published: true }
  if (category) q.category = category
  if (featured) q.featured = featured === 'true'
  if (project) q.project = project
  if (projectSlug) {
    // resolve a portfolio slug → project id
    const Portfolio = (await import('../models/Portfolio.js')).default
    const proj = await Portfolio.findOne({ slug: projectSlug }, '_id').lean()
    q.project = proj?._id || null
    if (!proj) return res.json({ items: [] })
  }
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
  // Only one video may be the pinned Reel hero at a time.
  if (item.featured) await Video.updateMany({ _id: { $ne: item._id } }, { $set: { featured: false } })
  await audit({ req, action: 'create', resource: 'video', resourceId: String(item._id), summary: `Created video "${item.title}"` })
  res.status(201).json({ item })
}))

// AUTHED: reorder — body { ids: [...] } sets `order` to the array position.
// Declared before '/:id' so the literal path isn't captured as an id.
r.put('/reorder', requireAuth, requirePermission('video.write'), asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : []
  if (!ids.length) { res.status(400); throw new Error('ids[] required') }
  await Video.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i } } } })))
  await audit({ req, action: 'reorder', resource: 'video', summary: `Reordered ${ids.length} videos` })
  res.json({ ok: true })
}))

r.put('/:id', requireAuth, requirePermission('video.write'), asyncHandler(async (req, res) => {
  const item = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!item) { res.status(404); throw new Error('Not found') }
  // Pinning this one as the Reel hero unpins any other.
  if (req.body.featured) await Video.updateMany({ _id: { $ne: item._id } }, { $set: { featured: false } })
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
