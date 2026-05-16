import mongoose from 'mongoose'

/**
 * Per-page SEO overrides keyed by `path` (e.g. '/', '/work', '/work/aroha-jewels').
 * If a path has no entry, the frontend falls back to defaults from siteCopy.meta.
 */
const SeoEntrySchema = new mongoose.Schema(
  {
    path:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    title:       { type: String },
    description: { type: String },
    canonical:   { type: String },
    ogImage:     { type: String },
    ogTitle:     { type: String },
    ogDescription:{ type: String },
    twitterCard: { type: String, enum: ['summary', 'summary_large_image'], default: 'summary_large_image' },
    schemaJSONLD:{ type: mongoose.Schema.Types.Mixed },     // raw JSON-LD object
    noindex:     { type: Boolean, default: false },
    updatedByName:{ type: String }
  },
  { timestamps: true }
)

// 301 redirects
const RedirectSchema = new mongoose.Schema(
  {
    from:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    to:    { type: String, required: true },
    code:  { type: Number, enum: [301, 302, 307, 308], default: 301 },
    note:  { type: String }
  },
  { timestamps: true }
)

export const SeoEntry = mongoose.model('SeoEntry', SeoEntrySchema)
export const Redirect = mongoose.model('Redirect', RedirectSchema)
