import mongoose from 'mongoose'

const JobSchema = new mongoose.Schema(
  {
    role:        { type: String, required: true },
    department:  { type: String },
    location:    { type: String, default: 'New Delhi' },
    type:        { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'], default: 'Full-time' },
    description: { type: String },
    requirements:[{ type: String }],
    applyEmail:  { type: String, default: 'careers@kalaakaari.in' },
    published:   { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('JobPost', JobSchema)
