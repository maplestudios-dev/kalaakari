import mongoose from 'mongoose'

const TestimonialSchema = new mongoose.Schema(
  {
    quote:    { type: String, required: true },
    author:   { type: String, required: true },
    role:     { type: String },
    company:  { type: String },
    avatar:   { type: String },
    project:  { type: mongoose.Schema.Types.ObjectId, ref: 'PortfolioProject' },
    videoUrl: { type: String },
    rating:   { type: Number, min: 1, max: 5 },
    featured: { type: Boolean, default: false },
    published:{ type: Boolean, default: true },
    order:    { type: Number, default: 0 }
  },
  { timestamps: true }
)

export default mongoose.model('Testimonial', TestimonialSchema)
