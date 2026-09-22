import Employee from '../models/Employee.js';

export const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const prefix = `EMP${year}`;

  const lastEmployee = await Employee.findOne({ employeeId: new RegExp(`^${prefix}`) })
    .sort({ employeeId: -1 })
    .select('employeeId');

  let sequence = 1;
  if (lastEmployee?.employeeId) {
    const lastSeq = parseInt(lastEmployee.employeeId.replace(prefix, ''), 10);
    if (!Number.isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};
