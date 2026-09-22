import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import EODReport from '../models/EODReport.js';
import SalaryRecord from '../models/SalaryRecord.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isAdmin) {
      const [
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        todayEODs,
        totalEODs,
        creditedSalaries,
        departmentStats,
        leaveStats,
      ] = await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ employmentStatus: 'active' }),
        LeaveRequest.countDocuments({ status: 'pending' }),
        EODReport.countDocuments({ workDate: today, status: 'submitted' }),
        EODReport.countDocuments({ status: 'submitted' }),
        SalaryRecord.countDocuments({ status: 'credited' }),
        Employee.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        LeaveRequest.aggregate([
          { $match: { status: 'approved' } },
          { $group: { _id: '$leaveType', count: { $sum: 1 }, days: { $sum: '$totalDays' } } },
        ]),
      ]);

      return ApiResponse.success(res, 'Admin dashboard stats', {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        eodStats: { today: todayEODs, total: totalEODs },
        creditedSalaries,
        departmentStats,
        leaveStats,
      });
    }

    const employeeId = req.user.employee._id;
    const [pendingLeaves, latestSalary, todayEOD, leaveBalance] = await Promise.all([
      LeaveRequest.countDocuments({ employee: employeeId, status: 'pending' }),
      SalaryRecord.findOne({ employee: employeeId, status: 'credited' }).sort('-creditDate'),
      EODReport.findOne({ employee: employeeId, workDate: today }),
      Employee.findById(employeeId).select('leaveBalance fullName employeeId'),
    ]);

    return ApiResponse.success(res, 'Staff dashboard stats', {
      employee: leaveBalance,
      pendingLeaves,
      latestSalary,
      todayEOD,
      eodSubmitted: todayEOD?.status === 'submitted',
    });
  } catch (error) {
    return next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const AuditLog = (await import('../models/AuditLog.js')).default;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('user', 'email role')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit, 10)),
      AuditLog.countDocuments(),
    ]);

    return ApiResponse.success(res, 'Audit logs fetched', {
      logs,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};
