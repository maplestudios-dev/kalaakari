import mongoose from 'mongoose'

/** Awards + Press mentions */
const PressSchema = new mongoose.Schema(
  {
    type:     { type: String, enum: ['Award','Press','Feature'], default: 'Press' },
    title:    { type: String, required: true },
    publication: { type: String },         // "Adweek", "Cannes Lions", "It's Nice That"
    date:     { type: Date },
    excerpt:  { type: String },
    url:      { type: String },
    logo:     { type: String },
    image:    { type: String },
    published:{ type: Boolean, default: true },
    order:    { type: Number, default: 0 }
  },
  { timestamps: true }
)

export default mongoose.model('Press', PressSchema)
