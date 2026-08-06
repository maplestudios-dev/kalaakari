import 'dotenv/config'
import path from 'node:path'
import express from 'express'
import mongoose from 'mongoose'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import portfolioRoutes from './routes/portfolio.js'
import contactRoutes from './routes/contact.js'
import blogRoutes from './routes/blog.js'
import careersRoutes from './routes/careers.js'
import homepageRoutes from './routes/homepage.js'
import categoryRoutes from './routes/categories.js'
import recommendationRoutes from './routes/recommendations.js'
import serviceRoutes from './routes/services.js'
import pageRoutes from './routes/pages.js'
import usersRoutes from './routes/users.js'
import auditRoutes from './routes/audit.js'
import siteCopyRoutes from './routes/siteCopy.js'
import seoRoutes from './routes/seo.js'
import videoRoutes from './routes/video.js'
import testimonialsRoutes from './routes/testimonials.js'
import mediaRoutes from './routes/media.js'
import { notFound, errorHandler } from './middleware/errors.js'

const app = express()

app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
// Custom pages upload their markup as multipart straight to disk (see
// routes/pages.js), so they need no JSON body allowance beyond the default.
app.use(express.json({ limit: '5mb' }))    // larger limit for JSON copy uploads
app.use(morgan('dev'))

const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({
  origin(origin, cb) {
    if (!origin || origins.length === 0 || origins.includes(origin)) return cb(null, true)
    cb(new Error('CORS blocked: ' + origin))
  },
  credentials: true
}))

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }))

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'kalaakaari-api', t: Date.now() }))

app.use('/api/auth',         authRoutes)
app.use('/api/portfolio',    portfolioRoutes)
app.use('/api/contact',      contactRoutes)
app.use('/api/blog',         blogRoutes)
app.use('/api/careers',      careersRoutes)
app.use('/api/homepage',     homepageRoutes)
app.use('/api/categories',   categoryRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/services',     serviceRoutes)
app.use('/api/pages',        pageRoutes)

// new modules
app.use('/api/users',        usersRoutes)
app.use('/api/audit',        auditRoutes)
app.use('/api/site-copy',    siteCopyRoutes)
app.use('/api/seo',          seoRoutes)
app.use('/api/video',        videoRoutes)
app.use('/api/media',        mediaRoutes)
app.use('/api',              testimonialsRoutes)  // exposes /testimonials and /press

// Custom-page markup lives under uploads/pages/ but must NOT be reachable
// through the static mount below — that would serve drafts to anyone who
// guessed the filename, bypassing the `published` check. Reads go through
// GET /api/pages/:slug, which enforces it.
app.use('/uploads/pages', (req, res) => res.status(404).json({ error: 'Not found', path: req.path }))

// Static serving of uploaded media — /uploads/* → apps/api/uploads/*
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '365d',
  immutable: true,
  fallthrough: false
}))

// sitemap.xml / robots.txt at root for convenience
app.get('/sitemap.xml', (req, res, next) => { req.url = '/api/seo/sitemap.xml'; next() })
app.get('/robots.txt',  (req, res, next) => { req.url = '/api/seo/robots.txt';  next() })

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000

async function start() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ MongoDB connected')
  app.listen(PORT, () => console.log(`✓ KALAAKAARI API on :${PORT}`))
}
start().catch((e) => { console.error(e); process.exit(1) })
