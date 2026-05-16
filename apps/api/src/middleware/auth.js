import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { hasPermission } from '../lib/permissions.js'

export async function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // hydrate user — needed for permissions + status check
    const user = await User.findById(payload.id).select('-passwordHash')
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    if (user.status === 'pending')   return res.status(403).json({ error: 'Account pending — accept your invite first' })
    req.user = { id: String(user._id), name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], status: user.status }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

export function requirePermission(perm) {
  return (req, res, next) => {
    if (!hasPermission(req.user, perm)) return res.status(403).json({ error: `Forbidden — needs ${perm}` })
    next()
  }
}
