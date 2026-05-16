import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import AuditLog from '../models/AuditLog.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

const r = Router()

r.get('/', requireAuth, requirePermission('audit.read'), asyncHandler(async (req, res) => {
  const { resource, action, actor, limit = 200 } = req.query
  const q = {}
  if (resource) q.resource = resource
  if (action)   q.action = action
  if (actor)    q.actor = actor
  const items = await AuditLog.find(q).sort({ createdAt: -1 }).limit(Math.min(+limit || 200, 1000)).populate('actor', 'name email role')
  res.json({ items })
}))

export default r
