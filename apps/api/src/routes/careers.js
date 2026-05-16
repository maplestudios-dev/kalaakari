import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import JobPost from '../models/JobPost.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()

r.get('/', asyncHandler(async (req, res) => {
  const items = await JobPost.find({ published: true }).sort({ createdAt: -1 })
  res.json({ items })
}))

r.post('/', requireAuth, asyncHandler(async (req, res) => {
  const item = await JobPost.create(req.body)
  res.status(201).json({ item })
}))

r.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await JobPost.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!item) { res.status(404); throw new Error('Job not found') }
  res.json({ item })
}))

r.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await JobPost.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Job not found') }
  res.json({ ok: true })
}))

export default r
