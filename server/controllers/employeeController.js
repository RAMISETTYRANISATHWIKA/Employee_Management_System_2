import Employee from '../models/Employee.js';
import User from '../models/User.js';
import LeaveRequest from '../models/LeaveRequest.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateEmployeeId } from '../utils/employeeIdGenerator.js';
import { createAuditLog } from '../services/auditService.js';
import { buildEmployeePassword } from '../utils/employeePassword.js';

export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
        { officialEmail: new RegExp(search, 'i') },
      ];
    }
    if (department) filter.department = department;
    if (status) filter.employmentStatus = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [employees, total] = await Promise.all([
      Employee.find(filter).sort(sort).skip(skip).limit(parseInt(limit, 10)).populate('reportingManager', 'fullName employeeId'),
      Employee.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Employees fetched', {
      employees,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('reportingManager', 'fullName employeeId');
    if (!employee) return ApiResponse.error(res, 'Employee not found', 404);

    if (req.user.role === 'staff' && req.user.employee._id.toString() !== employee._id.toString()) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    return ApiResponse.success(res, 'Employee fetched', { employee });
  } catch (error) {
    return next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const employeeId = await generateEmployeeId();
    const { fullName, officialEmail, role = 'staff', password, baseSalary, ...rest } = req.body;
    const generatedPassword = buildEmployeePassword(password, employeeId);

    const employee = await Employee.create({
      employeeId,
      fullName,
      officialEmail,
      baseSalary: baseSalary ?? 0,
      ...rest,
    });

    const adminPermissions = {
      manageEmployees: true,
      manageLeaves: true,
      manageSalaries: true,
      manageHolidays: true,
      manageAnnouncements: true,
      viewEODReports: true,
      viewAuditLogs: true,
      viewReports: true,
    };

    const user = await User.create({
      email: officialEmail,
      password: generatedPassword,
      role,
      employee: employee._id,
      permissions: role === 'admin' ? adminPermissions : {},
      mustChangePassword: !password,
    });

    await createAuditLog({
      user: req.user._id,
      action: 'CREATE_EMPLOYEE',
      resource: 'Employee',
      resourceId: employee._id,
      details: { employeeId },
      ipAddress: req.ip,
    });

    return ApiResponse.success(
      res,
      'Employee created',
      {
        employee,
        user: { id: user._id, email: user.email, role: user.role },
        temporaryPassword: generatedPassword,
      },
      201
    );
  } catch (error) {
    return next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const restricted = ['employeeId', 'baseSalary'];
    const updates = { ...req.body };

    if (req.user.role === 'staff') {
      restricted.forEach((f) => delete updates[f]);
      delete updates.employmentStatus;
      delete updates.role;
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) return ApiResponse.error(res, 'Employee not found', 404);

    await createAuditLog({
      user: req.user._id,
      action: 'UPDATE_EMPLOYEE',
      resource: 'Employee',
      resourceId: employee._id,
      details: updates,
      ipAddress: req.ip,
    });

    return ApiResponse.success(res, 'Employee updated', { employee });
  } catch (error) {
    return next(error);
  }
};

export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return ApiResponse.error(res, 'Employee not found', 404);

    employee.employmentStatus = employee.employmentStatus === 'active' ? 'inactive' : 'active';
    await employee.save();

    await User.updateOne(
      { employee: employee._id },
      { isActive: employee.employmentStatus === 'active' }
    );

    return ApiResponse.success(res, 'Employee status updated', { employee });
  } catch (error) {
    return next(error);
  }
};

export const getEmployeeLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.params.id }).sort('-createdAt');
    return ApiResponse.success(res, 'Leave history fetched', { leaves });
  } catch (error) {
    return next(error);
  }
};
