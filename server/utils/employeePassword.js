import crypto from 'crypto';

export const buildEmployeePassword = (password, employeeId) => {
  const trimmed = (password || '').trim();

  if (trimmed) return trimmed;

  const generated = `Emp@${employeeId || crypto.randomBytes(6).toString('hex')}`;
  return generated;
};
