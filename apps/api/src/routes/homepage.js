import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import HomepageSection from '../models/HomepageSection.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()

r.get('/', asyncHandler(async (req, res) => {
  let doc = await HomepageSection.findOne({ key: 'main' })
  if (!doc) doc = await HomepageSection.create({ key: 'main' })
  res.json({ homepage: doc })
}))

r.put('/', requireAuth, asyncHandler(async (req, res) => {
  const doc = await HomepageSection.findOneAndUpdate(
    { key: 'main' },
    { ...req.body, key: 'main' },
    { new: true, upsert: true, runValidators: true }
  )
  res.json({ homepage: doc })
}))

export default r
