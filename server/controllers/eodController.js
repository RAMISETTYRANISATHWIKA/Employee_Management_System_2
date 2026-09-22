import EODReport from '../models/EODReport.js';
import Employee from '../models/Employee.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { notifyUser } from '../services/notificationService.js';
import User from '../models/User.js';

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const createEOD = async (req, res, next) => {
  try {
    const workDate = normalizeDate(req.body.workDate || new Date());
    const existing = await EODReport.findOne({
      employee: req.user.employee._id,
      workDate,
      status: { $ne: 'draft' },
    });

    if (existing) {
      return ApiResponse.error(res, 'EOD report already submitted for this date', 409);
    }

    let report = await EODReport.findOne({
      employee: req.user.employee._id,
      workDate,
      status: 'draft',
    });

    if (report) {
      Object.assign(report, req.body, { workDate });
      await report.save();
    } else {
      report = await EODReport.create({
        ...req.body,
        workDate,
        employee: req.user.employee._id,
        status: req.body.status || 'draft',
      });
    }

    if (report.status === 'submitted') {
      report.submittedAt = new Date();
      await report.save();
    }

    return ApiResponse.success(res, 'EOD report saved', { report }, 201);
  } catch (error) {
    return next(error);
  }
};

export const getMyEODs = async (req, res, next) => {
  try {
    const { from, to, status, page = 1, limit = 10 } = req.query;
    const filter = { employee: req.user.employee._id };
    if (status) filter.status = status;
    if (from || to) {
      filter.workDate = {};
      if (from) filter.workDate.$gte = new Date(from);
      if (to) filter.workDate.$lte = new Date(to);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [reports, total] = await Promise.all([
      EODReport.find(filter).sort('-workDate').skip(skip).limit(parseInt(limit, 10)),
      EODReport.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'EOD reports fetched', {
      reports,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllEODs = async (req, res, next) => {
  try {
    const { department, search, status, from, to, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.workDate = {};
      if (from) filter.workDate.$gte = new Date(from);
      if (to) filter.workDate.$lte = new Date(to);
    }

    if (department || search) {
      const empFilter = {};
      if (department) empFilter.department = department;
      if (search) {
        empFilter.$or = [
          { fullName: new RegExp(search, 'i') },
          { employeeId: new RegExp(search, 'i') },
        ];
      }
      const employees = await Employee.find(empFilter).select('_id');
      filter.employee = { $in: employees.map((e) => e._id) };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [reports, total] = await Promise.all([
      EODReport.find(filter)
        .populate('employee', 'fullName employeeId department')
        .sort('-workDate')
        .skip(skip)
        .limit(parseInt(limit, 10)),
      EODReport.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'EOD reports fetched', {
      reports,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const reviewEOD = async (req, res, next) => {
  try {
    const { status, adminFeedback } = req.body;
    const report = await EODReport.findById(req.params.id).populate('employee');

    if (!report) return ApiResponse.error(res, 'EOD report not found', 404);
    if (report.status !== 'submitted') {
      return ApiResponse.error(res, 'Only submitted reports can be reviewed', 400);
    }

    report.status = status;
    report.adminFeedback = adminFeedback;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    const user = await User.findOne({ employee: report.employee._id });
    if (user) {
      await notifyUser(user._id, 'EOD Reviewed', `Your EOD report has been ${status}`, 'eod', report._id);
    }

    return ApiResponse.success(res, 'EOD reviewed', { report });
  } catch (error) {
    return next(error);
  }
};

export const updateEOD = async (req, res, next) => {
  try {
    const report = await EODReport.findById(req.params.id);
    if (!report) return ApiResponse.error(res, 'EOD not found', 404);

    if (report.employee.toString() !== req.user.employee._id.toString()) {
      return ApiResponse.error(res, 'Access denied', 403);
    }

    if (!['draft', 'returned'].includes(report.status)) {
      return ApiResponse.error(res, 'Cannot edit submitted report', 400);
    }

    Object.assign(report, req.body);
    if (req.body.status === 'submitted') {
      report.submittedAt = new Date();
    }
    await report.save();

    return ApiResponse.success(res, 'EOD updated', { report });
  } catch (error) {
    return next(error);
  }
};
