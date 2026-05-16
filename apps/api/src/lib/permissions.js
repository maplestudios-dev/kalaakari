/**
 * KALAAKAARI · Permission system
 *
 * Format: `resource.action`  (e.g. "portfolio.write", "users.invite")
 *
 * Roles aggregate permissions. Anyone with the `Owner` role has every
 * permission implicitly. Editors, Authors and Viewers get a subset.
 */

export const PERMISSIONS = [
  // portfolio
  'portfolio.read', 'portfolio.write', 'portfolio.publish', 'portfolio.delete',
  // blog
  'blog.read', 'blog.write', 'blog.publish', 'blog.delete',
  // careers
  'careers.read', 'careers.write', 'careers.delete',
  // leads
  'leads.read', 'leads.export', 'leads.delete',
  // homepage / copy
  'homepage.write', 'copy.read', 'copy.write', 'copy.restore',
  // seo
  'seo.read', 'seo.write',
  // video
  'video.read', 'video.write', 'video.delete',
  // testimonials / press
  'testimonials.write', 'press.write',
  // users / rbac
  'users.read', 'users.invite', 'users.suspend', 'users.delete', 'users.changeRole',
  // audit
  'audit.read'
]

export const ROLES = ['Owner', 'Admin', 'Editor', 'Author', 'Viewer']

export const ROLE_PERMISSIONS = {
  Owner:  PERMISSIONS,                                  // everything

  Admin: PERMISSIONS.filter((p) => !p.startsWith('users.delete')), // can't hard-delete users

  Editor: [
    'portfolio.read','portfolio.write','portfolio.publish',
    'blog.read','blog.write','blog.publish',
    'careers.read','careers.write',
    'leads.read','leads.export',
    'homepage.write','copy.read','copy.write',
    'seo.read','seo.write',
    'video.read','video.write',
    'testimonials.write','press.write',
    'audit.read'
  ],

  Author: [
    'portfolio.read','portfolio.write',                 // can draft, can't publish
    'blog.read','blog.write',
    'careers.read',
    'copy.read',
    'seo.read',
    'video.read'
  ],

  Viewer: [
    'portfolio.read','blog.read','careers.read','leads.read',
    'copy.read','seo.read','video.read','audit.read'
  ]
}

export function hasPermission(user, perm) {
  if (!user) return false
  if (user.role === 'Owner') return true
  const fromRole = ROLE_PERMISSIONS[user.role] || []
  const extra = user.permissions || []
  return fromRole.includes(perm) || extra.includes(perm)
}
