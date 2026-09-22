import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createAuditLog } from '../services/auditService.js';
import { ensureJwtSecret } from '../utils/jwtSecret.js';

const signToken = (userId) => {
  const secret = ensureJwtSecret();
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    let user = await User.findOne({ email: identifier.toLowerCase() })
      .select('+password')
      .populate('employee');

    if (!user) {
      const employee = await Employee.findOne({ employeeId: identifier.toUpperCase() });
      if (employee) {
        user = await User.findOne({ employee: employee._id })
          .select('+password')
          .populate('employee');
      }
    }

    if (!user || !(await user.comparePassword(password))) {
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Account is deactivated', 403);
    }

    if (user.role !== role) {
      return ApiResponse.error(res, `You do not have ${role} access`, 403);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    await createAuditLog({
      user: user._id,
      action: 'LOGIN',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
    });

    return ApiResponse.success(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        permissions: user.permissions,
        employee: user.employee,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('employee');
    return ApiResponse.success(res, 'Profile fetched', { user });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return ApiResponse.error(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    await createAuditLog({
      user: user._id,
      action: 'PASSWORD_CHANGE',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
    });

    return ApiResponse.success(res, 'Password changed successfully');
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res) => {
  await createAuditLog({
    user: req.user._id,
    action: 'LOGOUT',
    resource: 'User',
    resourceId: req.user._id,
    ipAddress: req.ip,
  });
  return ApiResponse.success(res, 'Logged out successfully');
};
