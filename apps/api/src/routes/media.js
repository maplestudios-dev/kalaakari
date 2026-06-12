import { Router } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import multer from 'multer'
import asyncHandler from 'express-async-handler'
import { requireAuth } from '../middleware/auth.js'
import { audit } from '../lib/audit.js'

const r = Router()

// ─── Upload destination ────────────────────────────────────────────────
// Files are saved to apps/api/uploads/<yyyy-mm>/<random>.<ext>
// Served back via GET /uploads/* (static mount in index.js)
const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true })

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const d = new Date()
    const sub = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const dir = path.join(UPLOAD_ROOT, sub)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || ''
    const safeExt = /^\.(jpg|jpeg|png|webp|gif|avif|svg|mp4|webm)$/i.test(ext) ? ext : '.bin'
    const id = crypto.randomBytes(10).toString('hex')
    cb(null, `${id}${safeExt}`)
  }
})

const fileFilter = (req, file, cb) => {
  const ok = /image\/(jpeg|jpg|png|webp|gif|avif|svg\+xml)|video\/(mp4|webm)/.test(file.mimetype)
  if (!ok) return cb(new Error('Unsupported file type: ' + file.mimetype))
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }   // 15 MB
})

// Determine the absolute URL we hand back to the admin
function publicUrlFor(req, relPath) {
  // Prefer PUBLIC_API_URL if set (handles nginx reverse-proxy on prod), else fall back to req.
  const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/api\/?$/, '')
  return `${base}/uploads/${relPath.replace(/\\/g, '/')}`
}

// POST /api/media  (multipart, field "file")
r.post('/', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded — use multipart field "file"') }
  const rel = path.relative(UPLOAD_ROOT, req.file.path)
  const url = publicUrlFor(req, rel)
  await audit({ req, action: 'upload', resource: 'media', summary: `Uploaded ${req.file.originalname} (${(req.file.size/1024).toFixed(1)} KB)` })
  res.status(201).json({
    url,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  })
}))

export default r
