import mongoose from 'mongoose'

const VersionSchema = new mongoose.Schema({
  version:   { type: Number, required: true },
  copy:      { type: mongoose.Schema.Types.Mixed, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String },
  note:      { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

/**
 * Singleton document — key: 'main'.
 * Stores the active site copy + a rolling history of prior versions (last 30).
 */
const SiteCopySchema = new mongoose.Schema(
  {
    key:           { type: String, default: 'main', unique: true },
    version:       { type: Number, default: 1 },
    copy:          { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedByName: { type: String },
    history:       { type: [VersionSchema], default: [] }
  },
  { timestamps: true }
)

export default mongoose.model('SiteCopy', SiteCopySchema)
