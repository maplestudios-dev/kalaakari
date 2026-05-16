import AuditLog from '../models/AuditLog.js'

/**
 * Fire-and-forget audit logger. Never throws — auditing must not break a request.
 */
export async function audit({ req, action, resource, resourceId, summary, before, after }) {
  try {
    const actor = req?.user
    await AuditLog.create({
      actor: actor?.id || null,
      actorName: actor?.name || actor?.email || 'system',
      action, resource, resourceId,
      summary,
      diff: (before || after) ? { before, after } : undefined,
      ip: req?.ip,
      ua: req?.headers?.['user-agent']
    })
  } catch (e) {
    // intentionally swallow
    console.warn('[audit] failed:', e.message)
  }
}
