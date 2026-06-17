import mongoose from 'mongoose'

const VideoSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    client:       { type: String },
    deva:         { type: String },
    // Optional link to a portfolio project — used for "related reels" on the
    // case study page and to power the homepage reel-by-work pairing.
    project:      { type: mongoose.Schema.Types.ObjectId, ref: 'PortfolioProject' },
    category:     { type: String, enum: ['Ad Film','Brand Film','Music Video','Reel','BTS','Short Film','Documentary','Other'], default: 'Ad Film' },
    duration:     { type: Number },                  // seconds
    year:         { type: Number },
    // primary playback source — exactly one of these
    youtubeId:    { type: String },
    vimeoId:      { type: String },
    mp4Url:       { type: String },
    // playback aspect — 'portrait' renders 9:16 (e.g. YouTube Shorts / Reels)
    orientation:  { type: String, enum: ['landscape', 'portrait'], default: 'landscape' },
    poster:       { type: String },                   // thumbnail URL
    posterAlt:    { type: String },                   // accessible alt
    previewUrl:   { type: String },                   // optional muted-loop preview MP4 for hover
    excerpt:      { type: String },
    credits:      [{ role: String, name: String }],   // [{ role: 'Director', name: '…' }, …]
    tags:         [{ type: String }],
    featured:     { type: Boolean, default: false },
    published:    { type: Boolean, default: true },
    order:        { type: Number, default: 0 }
  },
  { timestamps: true }
)

export default mongoose.model('Video', VideoSchema)
