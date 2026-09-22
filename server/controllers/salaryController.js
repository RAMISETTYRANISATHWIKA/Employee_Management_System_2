import SalaryRecord from '../models/SalaryRecord.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createAuditLog } from '../services/auditService.js';
import { notifyUser } from '../services/notificationService.js';

export const getMySalaries = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const filter = {
      employee: req.user.employee._id,
      status: { $in: ['approved', 'credited'] },
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [salaries, total] = await Promise.all([
      SalaryRecord.find(filter).sort('-creditDate').skip(skip).limit(parseInt(limit, 10)),
      SalaryRecord.countDocuments(filter),
    ]);

    const employee = await Employee.findById(req.user.employee._id).select('baseSalary');

    return ApiResponse.success(res, 'Salary records fetched', {
      currentSalary: employee?.baseSalary,
      salaries,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllSalaries = async (req, res, next) => {
  try {
    const { search, status, payrollPeriod, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (payrollPeriod) filter.payrollPeriod = payrollPeriod;

    if (search) {
      const employees = await Employee.find({
        $or: [{ fullName: new RegExp(search, 'i') }, { employeeId: new RegExp(search, 'i') }],
      }).select('_id');
      filter.employee = { $in: employees.map((e) => e._id) };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [salaries, total] = await Promise.all([
      SalaryRecord.find(filter)
        .populate('employee', 'fullName employeeId department')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit, 10)),
      SalaryRecord.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Salary records fetched', {
      salaries,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const createSalary = async (req, res, next) => {
  try {
    const { employee, payrollPeriod, grossSalary, deductions = 0, bonus = 0, notes } = req.body;
    const netSalary = grossSalary - deductions + bonus;

    const record = await SalaryRecord.create({
      employee,
      payrollPeriod,
      grossSalary,
      deductions,
      bonus,
      netSalary,
      notes,
      createdBy: req.user._id,
      status: 'draft',
    });

    await createAuditLog({
      user: req.user._id,
      action: 'CREATE_SALARY',
      resource: 'SalaryRecord',
      resourceId: record._id,
      ipAddress: req.ip,
    });

    return ApiResponse.success(res, 'Salary record created', { record }, 201);
  } catch (error) {
    return next(error);
  }
};

export const updateSalaryStatus = async (req, res, next) => {
  try {
    const { status, paymentReference, creditDate } = req.body;
    const record = await SalaryRecord.findById(req.params.id).populate('employee');

    if (!record) return ApiResponse.error(res, 'Salary record not found', 404);

    const validTransitions = {
      draft: ['pending_review'],
      pending_review: ['approved', 'draft'],
      approved: ['credited', 'failed'],
      credited: ['reversed'],
    };

    if (!validTransitions[record.status]?.includes(status)) {
      return ApiResponse.error(res, 'Invalid status transition', 400);
    }

    record.status = status;
    if (paymentReference) record.paymentReference = paymentReference;
    if (creditDate) record.creditDate = creditDate;
    if (status === 'approved') record.approvedBy = req.user._id;
    await record.save();

    if (status === 'credited') {
      const user = await User.findOne({ employee: record.employee._id });
      if (user) {
        await notifyUser(
          user._id,
          'Salary Credited',
          `Salary for ${record.payrollPeriod} has been credited`,
          'salary',
          record._id
        );
      }
    }

    await createAuditLog({
      user: req.user._id,
      action: `SALARY_${status.toUpperCase()}`,
      resource: 'SalaryRecord',
      resourceId: record._id,
      ipAddress: req.ip,
    });

    return ApiResponse.success(res, 'Salary status updated', { record });
  } catch (error) {
    return next(error);
  }
};
