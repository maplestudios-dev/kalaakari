import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Category from '../models/Category.js'
import Portfolio from '../models/Portfolio.js'
import Video from '../models/Video.js'
import BlogPost from '../models/BlogPost.js'
import { requireAuth } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

// First-run defaults so filter UIs are never empty. Seeded per type on demand.
const DEFAULTS = {
  portfolio: ['Branding', 'Campaign', 'Content', 'Digital', 'Performance', 'Production', 'Film', 'Social', 'Packaging', 'Identity'],
  video:     ['Ad Film', 'Brand Film', 'Music Video', 'Reel', 'BTS', 'Short Film', 'Documentary', 'Other'],
  journal:   ['Branding', 'Campaign Thinking', 'Cultural Strategy', 'Content & Social', 'Design', 'Advertising', 'Performance Creative', 'Studio Notes']
}
const MODELS = { portfolio: Portfolio, video: Video, journal: BlogPost }

async function ensureSeeded(type) {
  if (!DEFAULTS[type]) return
  const count = await Category.countDocuments({ type })
  if (count === 0) {
    await Category.insertMany(DEFAULTS[type].map((name, i) => ({ type, name, order: i })))
  }
}

const r = Router()

// PUBLIC: list (optionally ?type=portfolio|video|journal)
r.get('/', asyncHandler(async (req, res) => {
  const { type } = req.query
  const types = type ? [type] : Object.keys(DEFAULTS)
  for (const t of types) await ensureSeeded(t)
  const items = await Category.find(type ? { type } : {}).sort({ type: 1, order: 1, name: 1 })
  res.json({ items })
}))

// AUTHED: create
r.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { type, name } = req.body
  if (!type || !name) { res.status(400); throw new Error('type and name are required') }
  const last = await Category.findOne({ type }).sort({ order: -1 })
  const item = await Category.create({ type, name, order: last ? last.order + 1 : 0 })
  await audit({ req, action: 'create', resource: 'category', resourceId: String(item._id), summary: `Added ${type} category "${name}"` })
  res.status(201).json({ item })
}))

// AUTHED: reorder — declared before '/:id'
r.put('/reorder', requireAuth, asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : []
  if (!ids.length) { res.status(400); throw new Error('ids[] required') }
  await Category.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i } } } })))
  res.json({ ok: true })
}))

// AUTHED: rename — cascades the new name onto existing items of that type
r.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const before = await Category.findById(req.params.id)
  if (!before) { res.status(404); throw new Error('Category not found') }
  const name = (req.body.name || '').trim()
  if (!name) { res.status(400); throw new Error('name required') }
  const item = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true })
  if (name !== before.name && MODELS[before.type]) {
    await MODELS[before.type].updateMany({ category: before.name }, { $set: { category: name } })
  }
  await audit({ req, action: 'update', resource: 'category', resourceId: String(item._id), summary: `Renamed ${before.type} category "${before.name}" → "${name}"` })
  res.json({ item })
}))

// AUTHED: delete
r.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Category.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Category not found') }
  await audit({ req, action: 'delete', resource: 'category', resourceId: String(item._id), summary: `Deleted ${item.type} category "${item.name}"` })
  res.json({ ok: true })
}))

export default r
