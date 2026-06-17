import mongoose from 'mongoose'

/**
 * A studio service (Strategy, Branding, …) with CMS-editable copy and
 * attached Work projects + Reel videos shown on its detail page.
 */
const ServiceSchema = new mongoose.Schema(
  {
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:         { type: String, required: true },
    deva:         { type: String },
    number:       { type: String },            // display index e.g. '01'
    order:        { type: Number, default: 0 },
    description:  { type: String },             // about / intro copy
    body:         { type: String },             // longer copy (optional)
    capabilities: [{ type: String }],           // sub-capability tags
    workProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PortfolioProject' }],
    videos:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    published:    { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('Service', ServiceSchema)
