/**
 * RBAC Permission System for RMinios Research OS
 * Supports 8 user roles with granular resource-level permissions
 */

export const ROLES = {
  GUEST: 'guest',
  STUDENT: 'student',
  RESEARCHER: 'researcher',
  PROFESSOR: 'professor',
  TEAM_LEAD: 'team_lead',
  UNIVERSITY_ADMIN: 'university_admin',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const ROLE_HIERARCHY = [
  'guest', 'student', 'researcher', 'professor',
  'team_lead', 'university_admin', 'admin', 'superadmin'
];

// Permission matrix: role → allowed actions per resource
const PERMISSIONS = {
  guest: {
    workspace: ['read'],
    papers: ['read'],
    chat: [],
    brainstorm: [],
    editor: [],
    notes: [],
    datasets: [],
    projects: [],
    experiments: [],
    presentations: [],
    images: [],
    teams: [],
    admin: [],
    learning: ['read'],
  },
  student: {
    workspace: ['create', 'read', 'update', 'delete'],
    papers: ['create', 'read', 'update', 'delete', 'upload'],
    chat: ['create', 'read'],
    brainstorm: ['create', 'read'],
    editor: ['create', 'read', 'update', 'delete', 'ai_generate'],
    notes: ['create', 'read', 'update', 'delete'],
    datasets: ['create', 'read', 'update', 'delete', 'upload'],
    projects: ['create', 'read', 'update'],
    experiments: ['create', 'read', 'update'],
    presentations: ['create', 'read', 'update'],
    images: ['create', 'read', 'upload'],
    teams: ['read', 'join'],
    admin: [],
    learning: ['create', 'read', 'update'],
    integrity: ['read'],
    publication: ['read'],
  },
  researcher: {
    workspace: ['create', 'read', 'update', 'delete'],
    papers: ['create', 'read', 'update', 'delete', 'upload', 'export'],
    chat: ['create', 'read'],
    brainstorm: ['create', 'read', 'delete'],
    editor: ['create', 'read', 'update', 'delete', 'ai_generate', 'export'],
    notes: ['create', 'read', 'update', 'delete'],
    datasets: ['create', 'read', 'update', 'delete', 'upload', 'analyze'],
    projects: ['create', 'read', 'update', 'delete'],
    experiments: ['create', 'read', 'update', 'delete'],
    presentations: ['create', 'read', 'update', 'delete', 'export'],
    images: ['create', 'read', 'update', 'delete', 'upload', 'generate'],
    teams: ['create', 'read', 'join'],
    admin: [],
    learning: ['create', 'read', 'update'],
    integrity: ['create', 'read'],
    publication: ['create', 'read'],
    patent: ['read'],
  },
  professor: {
    workspace: ['create', 'read', 'update', 'delete'],
    papers: ['create', 'read', 'update', 'delete', 'upload', 'export', 'review'],
    chat: ['create', 'read'],
    brainstorm: ['create', 'read', 'delete'],
    editor: ['create', 'read', 'update', 'delete', 'ai_generate', 'export'],
    notes: ['create', 'read', 'update', 'delete'],
    datasets: ['create', 'read', 'update', 'delete', 'upload', 'analyze'],
    projects: ['create', 'read', 'update', 'delete'],
    experiments: ['create', 'read', 'update', 'delete'],
    presentations: ['create', 'read', 'update', 'delete', 'export'],
    images: ['create', 'read', 'update', 'delete', 'upload', 'generate'],
    teams: ['create', 'read', 'update', 'join', 'manage'],
    admin: [],
    learning: ['create', 'read', 'update', 'manage'],
    integrity: ['create', 'read'],
    publication: ['create', 'read'],
    patent: ['create', 'read'],
  },
  team_lead: {
    workspace: ['create', 'read', 'update', 'delete', 'share'],
    papers: ['create', 'read', 'update', 'delete', 'upload', 'export', 'review'],
    chat: ['create', 'read'],
    brainstorm: ['create', 'read', 'delete'],
    editor: ['create', 'read', 'update', 'delete', 'ai_generate', 'export'],
    notes: ['create', 'read', 'update', 'delete'],
    datasets: ['create', 'read', 'update', 'delete', 'upload', 'analyze'],
    projects: ['create', 'read', 'update', 'delete'],
    experiments: ['create', 'read', 'update', 'delete'],
    presentations: ['create', 'read', 'update', 'delete', 'export'],
    images: ['create', 'read', 'update', 'delete', 'upload', 'generate'],
    teams: ['create', 'read', 'update', 'delete', 'join', 'manage'],
    admin: [],
    learning: ['create', 'read', 'update', 'manage'],
    integrity: ['create', 'read'],
    publication: ['create', 'read'],
    patent: ['create', 'read'],
  },
  university_admin: {
    workspace: ['create', 'read', 'update', 'delete', 'share'],
    papers: ['create', 'read', 'update', 'delete', 'upload', 'export', 'review'],
    chat: ['create', 'read'],
    brainstorm: ['create', 'read', 'delete'],
    editor: ['create', 'read', 'update', 'delete', 'ai_generate', 'export'],
    notes: ['create', 'read', 'update', 'delete'],
    datasets: ['create', 'read', 'update', 'delete', 'upload', 'analyze'],
    projects: ['create', 'read', 'update', 'delete'],
    experiments: ['create', 'read', 'update', 'delete'],
    presentations: ['create', 'read', 'update', 'delete', 'export'],
    images: ['create', 'read', 'update', 'delete', 'upload', 'generate'],
    teams: ['create', 'read', 'update', 'delete', 'join', 'manage'],
    admin: ['read', 'users'],
    learning: ['create', 'read', 'update', 'manage'],
    integrity: ['create', 'read'],
    publication: ['create', 'read'],
    patent: ['create', 'read'],
  },
  admin: {
    _all: true, // Full access to everything except superadmin actions
    admin: ['read', 'users', 'content', 'settings', 'activity'],
  },
  superadmin: {
    _all: true,
    admin: ['read', 'users', 'content', 'settings', 'activity', 'system', 'delete_users', 'manage_admins'],
  },
};

/**
 * Check if a role has permission for a specific action on a resource
 */
export function canAccess(role, resource, action) {
  if (!role || !resource || !action) return false;
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  if (perms._all) return true;
  const resourcePerms = perms[resource];
  if (!resourcePerms) return false;
  return resourcePerms.includes(action);
}

/**
 * Check if a role is at or above a minimum level
 */
export function hasMinRole(userRole, minRole) {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minRole);
}

/**
 * Check if user is admin or superadmin
 */
export function isAdminRole(role) {
  return role === 'admin' || role === 'superadmin';
}

/**
 * Get all allowed actions for a role on a resource
 */
export function getAllowedActions(role, resource) {
  const perms = PERMISSIONS[role];
  if (!perms) return [];
  if (perms._all) return ['*'];
  return perms[resource] || [];
}

export const ROLE_LABELS = {
  guest: { label: 'Guest', color: '#64748b', icon: '👤' },
  student: { label: 'Student', color: '#6366f1', icon: '🎓' },
  researcher: { label: 'Researcher', color: '#2dd4bf', icon: '🔬' },
  professor: { label: 'Professor', color: '#fbbf24', icon: '👨‍🏫' },
  team_lead: { label: 'Team Lead', color: '#f97316', icon: '👥' },
  university_admin: { label: 'University Admin', color: '#8b5cf6', icon: '🏛️' },
  admin: { label: 'Admin', color: '#f43f5e', icon: '🛡️' },
  superadmin: { label: 'Super Admin', color: '#ef4444', icon: '⚡' },
};
