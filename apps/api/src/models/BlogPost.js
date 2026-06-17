import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    excerpt:     { type: String },
    body:        { type: String },
    cover:       { type: String },
    category:    { type: String, default: 'Studio Notes' },   // values managed via the Category CMS taxonomy
    author:      { type: String, default: 'Kalaakaari Studio' },
    seo: {
      title: String,
      description: String,
      ogImage: String
    },
    published:   { type: Boolean, default: false },
    publishedAt: { type: Date }
  },
  { timestamps: true }
)

export default mongoose.model('BlogPost', BlogSchema)
