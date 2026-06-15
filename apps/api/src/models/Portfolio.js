import mongoose from 'mongoose'

const PortfolioSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    client:      { type: String },
    deva:        { type: String },
    industry:    { type: String },
    category:    { type: String, enum: ['Branding','Campaign','Content','Digital','Performance','Production','Film','Social','Packaging','Identity'], default: 'Branding' },
    year:        { type: Number },
    cover:       { type: String },         // 4:3 thumbnail — used on cards (Work grid, homepage, related)
    coverWide:   { type: String },         // 16:9 widescreen — used on case-study hero. Falls back to `cover`.
    video:       { type: String },         // optional reel
    gallery:     [{ type: String }],
    excerpt:     { type: String },
    challenge:   { type: String },
    idea:        { type: String },
    execution:   { type: String },
    result:      { type: String },         // short tag, e.g. "4.2M Impressions"
    metrics:     [{ label: String, value: String }],
    services:    [{ type: String }],
    tags:        [{ type: String }],
    featured:    { type: Boolean, default: false },
    published:   { type: Boolean, default: true },
    order:       { type: Number, default: 0 }
  },
  { timestamps: true }
)

export default mongoose.model('PortfolioProject', PortfolioSchema)
