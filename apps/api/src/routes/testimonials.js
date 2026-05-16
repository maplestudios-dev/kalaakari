import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Testimonial from '../models/Testimonial.js'
import Press from '../models/Press.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

// ─── Testimonials ────────────────────────────────────────
r.get('/testimonials', asyncHandler(async (req, res) => {
  const items = await Testimonial.find({ published: true }).sort({ order: 1, createdAt: -1 }).populate('project', 'title slug')
  res.json({ items })
}))

r.post('/testimonials', requireAuth, requirePermission('testimonials.write'), asyncHandler(async (req, res) => {
  const item = await Testimonial.create(req.body)
  await audit({ req, action: 'create', resource: 'testimonials', resourceId: String(item._id) })
  res.status(201).json({ item })
}))

r.put('/testimonials/:id', requireAuth, requirePermission('testimonials.write'), asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'update', resource: 'testimonials', resourceId: String(item._id) })
  res.json({ item })
}))

r.delete('/testimonials/:id', requireAuth, requirePermission('testimonials.write'), asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'delete', resource: 'testimonials', resourceId: req.params.id })
  res.json({ ok: true })
}))

// ─── Press / Awards ──────────────────────────────────────
r.get('/press', asyncHandler(async (req, res) => {
  const items = await Press.find({ published: true }).sort({ order: 1, date: -1, createdAt: -1 })
  res.json({ items })
}))

r.post('/press', requireAuth, requirePermission('press.write'), asyncHandler(async (req, res) => {
  const item = await Press.create(req.body)
  await audit({ req, action: 'create', resource: 'press', resourceId: String(item._id) })
  res.status(201).json({ item })
}))

r.put('/press/:id', requireAuth, requirePermission('press.write'), asyncHandler(async (req, res) => {
  const item = await Press.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'update', resource: 'press', resourceId: String(item._id) })
  res.json({ item })
}))

r.delete('/press/:id', requireAuth, requirePermission('press.write'), asyncHandler(async (req, res) => {
  const item = await Press.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Not found') }
  await audit({ req, action: 'delete', resource: 'press', resourceId: req.params.id })
  res.json({ ok: true })
}))

export default r
