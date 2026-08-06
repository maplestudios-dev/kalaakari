import mongoose from 'mongoose'

/**
 * A standalone custom HTML page (e.g. a client proposal) hosted at a custom
 * slug — kalaakaari.in/<slug>.
 *
 * The markup itself lives on disk (see lib/pageStore.js) and is referenced here
 * by `htmlPath`; storing it inline capped a page at BSON's 16 MB document limit.
 * `bytes` is denormalised so the CMS can list sizes without touching the disk.
 */
const PageSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    htmlPath:  { type: String, default: '' },
    bytes:     { type: Number, default: 0 },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('Page', PageSchema)
