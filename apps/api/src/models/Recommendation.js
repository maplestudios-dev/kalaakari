import mongoose from 'mongoose'

/**
 * Team picks — music, movies, and books — shown on /recommendations.
 * Fully CMS-managed.
 */
const RecommendationSchema = new mongoose.Schema(
  {
    type:      { type: String, enum: ['music', 'movie', 'book'], default: 'music', index: true },
    title:     { type: String, required: true },
    creator:   { type: String },   // artist · director · author
    cover:     { type: String },   // cover art / poster URL
    note:      { type: String },   // a short "why we love it"
    link:      { type: String },   // Spotify / IMDb / Goodreads etc.
    order:     { type: Number, default: 0 },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('Recommendation', RecommendationSchema)
