import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import BlogPost from '../models/BlogPost.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()

r.get('/', asyncHandler(async (req, res) => {
  const { category } = req.query
  const q = { published: true }
  if (category) q.category = category
  const items = await BlogPost.find(q).sort({ publishedAt: -1, createdAt: -1 }).limit(50)
  res.json({ items })
}))

r.get('/:slug', asyncHandler(async (req, res) => {
  const item = await BlogPost.findOne({ slug: req.params.slug, published: true })
  if (!item) { res.status(404); throw new Error('Post not found') }
  res.json({ item })
}))

r.post('/', requireAuth, asyncHandler(async (req, res) => {
  const item = await BlogPost.create(req.body)
  res.status(201).json({ item })
}))

r.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!item) { res.status(404); throw new Error('Post not found') }
  res.json({ item })
}))

r.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await BlogPost.findByIdAndDelete(req.params.id)
  if (!item) { res.status(404); throw new Error('Post not found') }
  res.json({ ok: true })
}))

export default r
