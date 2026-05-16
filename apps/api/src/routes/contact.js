import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import ContactSubmission from '../models/ContactSubmission.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'
import { notifyOnLead } from '../lib/notifications.js'

const r = Router()

const formLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many submissions, try again later' } })

const Schema = z.object({
  name: z.string().min(2).max(120),
  brand: z.string().min(1).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(''),
  service: z.string().min(1).max(80),
  budget: z.string().min(1).max(80),
  timeline: z.string().min(1).max(80),
  message: z.string().min(10).max(4000)
})

// PUBLIC: create submission
r.post('/', formLimit, asyncHandler(async (req, res) => {
  const data = Schema.parse(req.body)
  const sub = await ContactSubmission.create({ ...data, ip: req.ip })

  // notify (fire-and-forget — failure must not break submission)
  notifyOnLead(sub).catch((e) => console.warn('[notify] failed:', e.message))

  res.status(201).json({ ok: true, id: sub._id })
}))

// AUTHED list
r.get('/', requireAuth, requirePermission('leads.read'), asyncHandler(async (req, res) => {
  const { service, read } = req.query
  const q = {}
  if (service) q.service = service
  if (read != null) q.read = read === 'true'
  const items = await ContactSubmission.find(q).sort({ createdAt: -1 }).limit(500)
  res.json({ items })
}))

r.patch('/:id', requireAuth, requirePermission('leads.read'), asyncHandler(async (req, res) => {
  const before = await ContactSubmission.findById(req.params.id).lean()
  const item = await ContactSubmission.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!item) { res.status(404); throw new Error('Submission not found') }
  await audit({ req, action: 'update', resource: 'leads', resourceId: String(item._id), summary: `Lead ${item.email} updated`, before, after: item.toObject() })
  res.json({ item })
}))

r.delete('/:id', requireAuth, requirePermission('leads.delete'), asyncHandler(async (req, res) => {
  const item = await ContactSubmission.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Submission not found') }
  await audit({ req, action: 'delete', resource: 'leads', resourceId: req.params.id, summary: `Deleted lead from ${item.email}` })
  res.json({ ok: true })
}))

// ADMIN export
r.get('/export.csv', requireAuth, requirePermission('leads.export'), asyncHandler(async (req, res) => {
  const items = await ContactSubmission.find().sort({ createdAt: -1 }).limit(5000)
  const header = ['createdAt','name','brand','email','phone','service','budget','timeline','message']
  const esc = (v) => `"${String(v ?? '').replace(/"/g,'""').replace(/\n/g,' ')}"`
  const lines = [header.join(','), ...items.map((i) => header.map((h) => esc(i[h])).join(','))]
  await audit({ req, action: 'export', resource: 'leads', summary: `Exported ${items.length} leads as CSV` })
  res.setHeader('Content-Type','text/csv')
  res.setHeader('Content-Disposition','attachment; filename="kalaakaari-leads.csv"')
  res.send(lines.join('\n'))
}))

export default r
