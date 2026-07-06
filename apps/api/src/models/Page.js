import mongoose from 'mongoose'

/**
 * A standalone custom HTML page (e.g. a client proposal) hosted at a custom
 * slug — kalaakaari.in/<slug>. The full HTML document is stored verbatim and
 * rendered in an isolated iframe on the site.
 */
const PageSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    html:      { type: String, default: '' },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('Page', PageSchema)
