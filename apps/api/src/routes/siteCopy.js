import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import SiteCopy from '../models/SiteCopy.js'
import { defaultCopy } from '../lib/defaultCopy.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

async function ensure() {
  let doc = await SiteCopy.findOne({ key: 'main' })
  if (!doc) doc = await SiteCopy.create({ key: 'main', version: 1, copy: defaultCopy })
  return doc
}

// PUBLIC — the web app fetches this once at boot
r.get('/', asyncHandler(async (req, res) => {
  const doc = await ensure()
  res.json({ version: doc.version, copy: doc.copy, updatedAt: doc.updatedAt })
}))

// PUBLIC default — for "reset to defaults" or initial scaffolding
r.get('/default', asyncHandler(async (req, res) => {
  res.json({ copy: defaultCopy })
}))

// AUTHED versions
r.get('/versions', requireAuth, requirePermission('copy.read'), asyncHandler(async (req, res) => {
  const doc = await ensure()
  res.json({
    current: { version: doc.version, updatedAt: doc.updatedAt, updatedByName: doc.updatedByName },
    history: doc.history.sort((a, b) => b.version - a.version).slice(0, 30)
  })
}))

// AUTHED save
r.put('/', requireAuth, requirePermission('copy.write'), asyncHandler(async (req, res) => {
  const { copy, note } = req.body || {}
  if (!copy || typeof copy !== 'object' || Array.isArray(copy)) { res.status(400); throw new Error('Body.copy must be a JSON object') }

  const doc = await ensure()

  // push current version into history
  doc.history.unshift({
    version: doc.version, copy: doc.copy,
    updatedBy: doc.updatedBy, updatedByName: doc.updatedByName,
    note, createdAt: doc.updatedAt
  })
  // cap history at 30 entries
  doc.history = doc.history.slice(0, 30)

  doc.version = (doc.version || 0) + 1
  doc.copy = copy
  doc.updatedByName = req.user.name || req.user.email
  await doc.save()

  await audit({ req, action: 'update', resource: 'copy', resourceId: 'main', summary: `Site copy → v${doc.version}` + (note ? ` (${note})` : '') })

  res.json({ version: doc.version, copy: doc.copy, updatedAt: doc.updatedAt })
}))

// AUTHED restore a specific version
r.post('/restore/:version', requireAuth, requirePermission('copy.restore'), asyncHandler(async (req, res) => {
  const v = +req.params.version
  const doc = await ensure()
  const target = doc.history.find((h) => h.version === v)
  if (!target) { res.status(404); throw new Error('Version not found') }

  doc.history.unshift({
    version: doc.version, copy: doc.copy,
    updatedByName: doc.updatedByName, note: `Pre-restore snapshot`, createdAt: doc.updatedAt
  })
  doc.history = doc.history.slice(0, 30)

  doc.version = (doc.version || 0) + 1
  doc.copy = target.copy
  doc.updatedByName = req.user.name || req.user.email
  await doc.save()

  await audit({ req, action: 'restore', resource: 'copy', resourceId: 'main', summary: `Restored copy to v${v} → new v${doc.version}` })

  res.json({ version: doc.version, copy: doc.copy })
}))

export default r
