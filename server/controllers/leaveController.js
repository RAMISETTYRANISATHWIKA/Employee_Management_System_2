import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { calculateLeaveDays, datesOverlap } from '../services/leaveService.js';
import { notifyUser } from '../services/notificationService.js';
import { createAuditLog } from '../services/auditService.js';

export const createLeave = async (req, res, next) => {
  try {
    const employeeId = req.user.employee._id;
    const { leaveType, startDate, endDate, dayType, reason, attachment } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
      return ApiResponse.error(res, 'Start date cannot be after end date', 400);
    }

    const overlapping = await LeaveRequest.findOne({
      employee: employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });

    if (overlapping) {
      return ApiResponse.error(res, 'Overlapping leave request exists', 409);
    }

    const totalDays = calculateLeaveDays(startDate, endDate, dayType);
    const employee = await Employee.findById(employeeId);

    const balanceKey = ['annual', 'sick', 'casual'].includes(leaveType) ? leaveType : null;
    if (balanceKey && employee.leaveBalance[balanceKey] < totalDays) {
      return ApiResponse.error(res, 'Insufficient leave balance', 400);
    }

    const leave = await LeaveRequest.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      dayType,
      reason,
      attachment,
      totalDays,
    });

    const admins = await User.find({ role: 'admin', isActive: true });
    await Promise.all(
      admins.map((admin) =>
        notifyUser(admin._id, 'New Leave Request', `${employee.fullName} submitted a leave request`, 'leave', leave._id)
      )
    );

    return ApiResponse.success(res, 'Leave request created', { leave }, 201);
  } catch (error) {
    return next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { employee: req.user.employee._id };
    if (status) filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [leaves, total] = await Promise.all([
      LeaveRequest.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit, 10)),
      LeaveRequest.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Leaves fetched', {
      leaves,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const { status, department, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    let employeeFilter = {};
    if (department) employeeFilter.department = department;
    if (search) {
      const employees = await Employee.find({
        $or: [{ fullName: new RegExp(search, 'i') }, { employeeId: new RegExp(search, 'i') }],
        ...employeeFilter,
      }).select('_id');
      filter.employee = { $in: employees.map((e) => e._id) };
    } else if (department) {
      const employees = await Employee.find(employeeFilter).select('_id');
      filter.employee = { $in: employees.map((e) => e._id) };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [leaves, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('employee', 'fullName employeeId department')
        .populate('reviewedBy', 'email')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit, 10)),
      LeaveRequest.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'All leaves fetched', {
      leaves,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const reviewLeave = async (req, res, next) => {
  try {
    const { status, approvalComment } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate('employee');

    if (!leave) return ApiResponse.error(res, 'Leave request not found', 404);
    if (leave.status !== 'pending') {
      return ApiResponse.error(res, 'Leave request already processed', 400);
    }

    leave.status = status;
    leave.approvalComment = approvalComment;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    if (status === 'approved') {
      const balanceKey = ['annual', 'sick', 'casual'].includes(leave.leaveType) ? leave.leaveType : null;
      if (balanceKey) {
        await Employee.findByIdAndUpdate(leave.employee._id, {
          $inc: { [`leaveBalance.${balanceKey}`]: -leave.totalDays },
        });
      }
    }

    const employeeUser = await User.findOne({ employee: leave.employee._id });
    if (employeeUser) {
      await notifyUser(
        employeeUser._id,
        `Leave ${status}`,
        `Your leave request has been ${status}`,
        'leave',
        leave._id
      );
    }

    await createAuditLog({
      user: req.user._id,
      action: `LEAVE_${status.toUpperCase()}`,
      resource: 'LeaveRequest',
      resourceId: leave._id,
      ipAddress: req.ip,
    });

    return ApiResponse.success(res, `Leave ${status}`, { leave });
  } catch (error) {
    return next(error);
  }
};

export const cancelLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return ApiResponse.error(res, 'Leave not found', 404);

    if (leave.employee.toString() !== req.user.employee._id.toString()) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    if (leave.status !== 'pending') {
      return ApiResponse.error(res, 'Only pending requests can be cancelled', 400);
    }

    leave.status = 'cancelled';
    await leave.save();

    return ApiResponse.success(res, 'Leave cancelled', { leave });
  } catch (error) {
    return next(error);
  }
};
