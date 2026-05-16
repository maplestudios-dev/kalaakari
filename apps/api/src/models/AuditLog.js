import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema(
  {
    actor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    action:    { type: String, required: true },     // create | update | delete | publish | login | invite | suspend | role-change
    resource:  { type: String, required: true },     // portfolio | blog | leads | users | copy | seo | video | …
    resourceId:{ type: String },
    summary:   { type: String },
    diff:      { type: mongoose.Schema.Types.Mixed }, // { before, after } — light diff
    ip:        { type: String },
    ua:        { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

AuditLogSchema.index({ createdAt: -1 })
AuditLogSchema.index({ resource: 1, createdAt: -1 })

export default mongoose.model('AuditLog', AuditLogSchema)
