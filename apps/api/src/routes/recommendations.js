import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Recommendation from '../models/Recommendation.js'
import { requireAuth } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

// PUBLIC: list (optionally ?type=music|movie|book)
r.get('/', asyncHandler(async (req, res) => {
  const q = { published: true }
  if (req.query.type) q.type = req.query.type
  const items = await Recommendation.find(q).sort({ order: 1, createdAt: -1 })
  res.json({ items })
}))

// AUTHED: all incl. drafts — for the CMS
r.get('/all', requireAuth, asyncHandler(async (req, res) => {
  const items = await Recommendation.find({}).sort({ order: 1, createdAt: -1 })
  res.json({ items })
}))

// AUTHED: create
r.post('/', requireAuth, asyncHandler(async (req, res) => {
  const item = await Recommendation.create(req.body)
  await audit({ req, action: 'create', resource: 'recommendation', resourceId: String(item._id), summary: `Added ${item.type} "${item.title}"` })
  res.status(201).json({ item })
}))

// AUTHED: reorder — declared before '/:id'
r.put('/reorder', requireAuth, asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : []
  if (!ids.length) { res.status(400); throw new Error('ids[] required') }
  await Recommendation.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i } } } })))
  res.json({ ok: true })
}))

// AUTHED: update
r.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Recommendation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!item) { res.status(404); throw new Error('Not found') }
  res.json({ item })
}))

// AUTHED: delete
r.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Recommendation.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Not found') }
  res.json({ ok: true })
}))

export default r
