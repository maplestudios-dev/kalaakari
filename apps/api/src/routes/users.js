import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import { ROLES } from '../lib/permissions.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

// list
r.get('/', requireAuth, requirePermission('users.read'), asyncHandler(async (req, res) => {
  const items = await User.find().sort({ createdAt: -1 }).select('-passwordHash -inviteToken')
  res.json({ items })
}))

// invite (creates pending user + token)
r.post('/invite', requireAuth, requirePermission('users.invite'), asyncHandler(async (req, res) => {
  const { name, email, role, permissions = [] } = req.body || {}
  if (!name || !email || !role) { res.status(400); throw new Error('Name, email, and role are required') }
  if (!ROLES.includes(role))    { res.status(400); throw new Error('Invalid role') }
  if (role === 'Owner' && req.user.role !== 'Owner') { res.status(403); throw new Error('Only an Owner can invite an Owner') }

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) { res.status(409); throw new Error('A user with that email already exists') }

  const inviteToken = crypto.randomBytes(24).toString('hex')
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const u = await User.create({
    name, email: email.toLowerCase(), role, permissions,
    status: 'pending', inviteToken, inviteExpiresAt, invitedBy: req.user.id
  })

  await audit({ req, action: 'invite', resource: 'users', resourceId: String(u._id), summary: `Invited ${email} as ${role}` })

  // The accept URL is built by the admin client — we return the token so the
  // admin can copy/share it (or in production, email it via SMTP).
  const acceptUrl = `${req.headers.origin || ''}/accept-invite?token=${inviteToken}`
  res.status(201).json({ user: u.toSafeJSON(), inviteToken, acceptUrl })
}))

// accept invite (public — token-gated)
r.post('/accept-invite', asyncHandler(async (req, res) => {
  const { token, password } = req.body || {}
  if (!token || !password || password.length < 8) { res.status(400); throw new Error('Token and a strong password (≥8 chars) are required') }
  const u = await User.findOne({ inviteToken: token })
  if (!u || !u.inviteExpiresAt || u.inviteExpiresAt < new Date()) { res.status(400); throw new Error('Invite is invalid or expired') }
  u.passwordHash = await bcrypt.hash(password, 10)
  u.status = 'active'
  u.inviteToken = undefined
  u.inviteExpiresAt = undefined
  await u.save()
  await audit({ req, action: 'invite-accept', resource: 'users', resourceId: String(u._id), summary: `${u.email} accepted invite` })
  res.json({ ok: true })
}))

// change role / permissions
r.patch('/:id', requireAuth, requirePermission('users.changeRole'), asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id)
  if (!u) { res.status(404); throw new Error('User not found') }
  if (u.role === 'Owner' && req.user.role !== 'Owner') { res.status(403); throw new Error('Only an Owner can modify an Owner') }
  const { role, permissions, name } = req.body || {}
  const before = { role: u.role, permissions: u.permissions, name: u.name }
  if (role && ROLES.includes(role)) u.role = role
  if (Array.isArray(permissions))   u.permissions = permissions
  if (name)                          u.name = name
  await u.save()
  await audit({ req, action: 'role-change', resource: 'users', resourceId: String(u._id), summary: `Updated ${u.email}`, before, after: { role: u.role, permissions: u.permissions, name: u.name } })
  res.json({ user: u.toSafeJSON() })
}))

// suspend / reactivate
r.post('/:id/suspend', requireAuth, requirePermission('users.suspend'), asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id)
  if (!u) { res.status(404); throw new Error('User not found') }
  if (u.role === 'Owner') { res.status(403); throw new Error('Owner cannot be suspended') }
  u.status = u.status === 'suspended' ? 'active' : 'suspended'
  await u.save()
  await audit({ req, action: u.status === 'suspended' ? 'suspend' : 'unsuspend', resource: 'users', resourceId: String(u._id), summary: `${u.email} → ${u.status}` })
  res.json({ user: u.toSafeJSON() })
}))

// reset password (admin-initiated — issues a new invite token)
r.post('/:id/reset-password', requireAuth, requirePermission('users.changeRole'), asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id)
  if (!u) { res.status(404); throw new Error('User not found') }
  const inviteToken = crypto.randomBytes(24).toString('hex')
  u.inviteToken = inviteToken
  u.inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  u.passwordHash = undefined
  u.status = 'pending'
  await u.save()
  await audit({ req, action: 'reset-password', resource: 'users', resourceId: String(u._id), summary: `${u.email} password reset` })
  const acceptUrl = `${req.headers.origin || ''}/accept-invite?token=${inviteToken}`
  res.json({ inviteToken, acceptUrl })
}))

// delete
r.delete('/:id', requireAuth, requirePermission('users.delete'), asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id)
  if (!u) { res.status(404); throw new Error('User not found') }
  if (u.role === 'Owner') { res.status(403); throw new Error('Owner cannot be deleted') }
  await u.deleteOne()
  await audit({ req, action: 'delete', resource: 'users', resourceId: req.params.id, summary: `Deleted ${u.email}` })
  res.json({ ok: true })
}))

export default r
