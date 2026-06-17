import mongoose from 'mongoose'

/**
 * CMS-editable filter taxonomy. One document per category, scoped by `type`
 * (portfolio | video | journal). Items store the category `name` as a string,
 * so `name` is the source of truth for filter labels and matching.
 */
const CategorySchema = new mongoose.Schema(
  {
    type:  { type: String, enum: ['portfolio', 'video', 'journal'], required: true, index: true },
    name:  { type: String, required: true, trim: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
)

CategorySchema.index({ type: 1, name: 1 }, { unique: true })

export default mongoose.model('Category', CategorySchema)
