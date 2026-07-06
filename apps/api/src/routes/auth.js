import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import rateLimit from 'express-rate-limit'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { ROLE_PERMISSIONS } from '../lib/permissions.js'
import { audit } from '../lib/audit.js'

const r = Router()

const loginLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, message: { error: 'Too many login attempts, try later' } })

r.post('/login', loginLimit, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) { res.status(400); throw new Error('Email and password required') }
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user || !user.passwordHash) { res.status(401); throw new Error('Invalid credentials') }
  if (user.status === 'suspended') { res.status(403); throw new Error('Account suspended') }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) { res.status(401); throw new Error('Invalid credentials') }

  user.lastLoginAt = new Date()
  await user.save()

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  )

  await audit({ req, action: 'login', resource: 'users', resourceId: String(user._id), summary: `${user.email} signed in` })

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], status: user.status },
    rolePermissions: ROLE_PERMISSIONS[user.role] || []
  })
}))

r.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash -inviteToken')
  res.json({
    user,
    rolePermissions: ROLE_PERMISSIONS[user.role] || []
  })
}))

// Change your own password — verifies the current one first.
r.post('/change-password', requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) { res.status(400); throw new Error('Current and new password are required') }
  if (String(newPassword).length < 8) { res.status(400); throw new Error('New password must be at least 8 characters') }

  const user = await User.findById(req.user.id)
  if (!user || !user.passwordHash) { res.status(404); throw new Error('Account not found') }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) { res.status(401); throw new Error('Current password is incorrect') }

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  await user.save()
  await audit({ req, action: 'password-change', resource: 'users', resourceId: String(user._id), summary: `${user.email} changed their password` })

  res.json({ ok: true })
}))

export default r
