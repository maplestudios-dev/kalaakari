import mongoose from 'mongoose'

const VideoSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    client:       { type: String },
    deva:         { type: String },
    category:     { type: String, enum: ['Ad Film','Brand Film','Music Video','Reel','BTS','Short Film','Documentary','Other'], default: 'Ad Film' },
    duration:     { type: Number },                  // seconds
    year:         { type: Number },
    // primary playback source — exactly one of these
    youtubeId:    { type: String },
    vimeoId:      { type: String },
    mp4Url:       { type: String },
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
