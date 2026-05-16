import mongoose from 'mongoose'
import { ROLES } from '../lib/permissions.js'

const UserSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },                       // empty until invite accepted
    role:         { type: String, enum: ROLES, default: 'Viewer' },
    permissions:  [{ type: String }],                    // optional per-user grants
    status:       { type: String, enum: ['active','suspended','pending'], default: 'pending' },
    inviteToken:  { type: String, index: true },
    inviteExpiresAt: { type: Date },
    invitedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastLoginAt:  { type: Date },
    avatar:       { type: String }
  },
  { timestamps: true }
)

UserSchema.methods.toSafeJSON = function () {
  const o = this.toObject()
  delete o.passwordHash
  delete o.inviteToken
  return o
}

export default mongoose.model('User', UserSchema)
