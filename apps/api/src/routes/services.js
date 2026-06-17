import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import Service from '../models/Service.js'
import { requireAuth } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

// Seeded once so the six existing services appear in the CMS on first load.
const DEFAULTS = [
  { slug: 'strategy',    name: 'Strategy',    deva: 'रणनीति',  number: '01', description: 'Positioning, architecture and narrative that give a brand a sharper edge.', capabilities: ['Brand positioning', 'Architecture', 'Narrative', 'Market & consumer analysis', 'Go-to-market'] },
  { slug: 'branding',    name: 'Branding',    deva: 'पहचान',   number: '02', description: 'Identity systems built to be remembered, not just seen.', capabilities: ['Visual identity', 'Naming', 'Brand guidelines', 'Key messaging', 'Art direction'] },
  { slug: 'content',     name: 'Content',     deva: 'कथा',     number: '03', description: 'Stories that earn attention across film, editorial and social.', capabilities: ['Ad films', 'Editorial photography', 'Scripting', 'Reels', 'Short & long-form storytelling'] },
  { slug: 'digital',     name: 'Digital',     deva: 'डिजिटल',  number: '04', description: 'Interfaces and systems that make the brand work everywhere.', capabilities: ['UI/UX', 'Design systems', 'Interactive prototypes', 'Websites', 'Digital asset systems'] },
  { slug: 'performance', name: 'Performance', deva: 'प्रदर्शन', number: '05', description: 'Creative engineered to convert across paid channels.', capabilities: ['Paid social', 'Search', 'Funnel design', 'Creative testing', 'Optimisation'] },
  { slug: 'production',  name: 'Production',  deva: 'निर्माण',  number: '06', description: 'End-to-end production — from set to screen.', capabilities: ['Video production', '3D & CGI', 'Photography', 'Motion design', 'Animation'] }
]

async function ensureSeeded() {
  const count = await Service.countDocuments()
  if (count === 0) await Service.insertMany(DEFAULTS.map((d, i) => ({ ...d, order: i })))
}

const r = Router()

// PUBLIC: list
r.get('/', asyncHandler(async (req, res) => {
  await ensureSeeded()
  const items = await Service.find({ published: true }).sort({ order: 1 })
  res.json({ items })
}))

// AUTHED: all incl. drafts, with names for the picker — for the CMS
r.get('/all', requireAuth, asyncHandler(async (req, res) => {
  await ensureSeeded()
  const items = await Service.find({}).sort({ order: 1 })
  res.json({ items })
}))

// PUBLIC: single by slug, with attached work + videos populated
r.get('/:slug', asyncHandler(async (req, res) => {
  await ensureSeeded()
  const item = await Service.findOne({ slug: req.params.slug, published: true })
    .populate({ path: 'workProjects', match: { published: true } })
    .populate({ path: 'videos', match: { published: true } })
  if (!item) { res.status(404); throw new Error('Service not found') }
  res.json({ item })
}))

// AUTHED: create
r.post('/', requireAuth, asyncHandler(async (req, res) => {
  const item = await Service.create(req.body)
  await audit({ req, action: 'create', resource: 'service', resourceId: String(item._id), summary: `Created service "${item.name}"` })
  res.status(201).json({ item })
}))

// AUTHED: reorder — before '/:id'
r.put('/reorder', requireAuth, asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : []
  if (!ids.length) { res.status(400); throw new Error('ids[] required') }
  await Service.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i } } } })))
  res.json({ ok: true })
}))

// AUTHED: update
r.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!item) { res.status(404); throw new Error('Service not found') }
  await audit({ req, action: 'update', resource: 'service', resourceId: String(item._id), summary: `Updated service "${item.name}"` })
  res.json({ item })
}))

// AUTHED: delete
r.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Service.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Service not found') }
  await audit({ req, action: 'delete', resource: 'service', resourceId: String(item._id), summary: `Deleted service "${item.name}"` })
  res.json({ ok: true })
}))

export default r
