import AuditLog from '../models/AuditLog.js';

export const createAuditLog = async ({ user, action, resource, resourceId, details, ipAddress }) => {
  try {
    await AuditLog.create({ user, action, resource, resourceId, details, ipAddress });
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};
