import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    brand:    { type: String, required: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    phone:    { type: String },
    service:  { type: String, required: true },
    budget:   { type: String, required: true },
    timeline: { type: String, required: true },
    message:  { type: String, required: true },
    read:     { type: Boolean, default: false },
    ip:       { type: String }
  },
  { timestamps: true }
)

export default mongoose.model('ContactSubmission', ContactSchema)
