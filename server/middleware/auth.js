import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ensureJwtSecret } from '../utils/jwtSecret.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, ensureJwtSecret());

    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('employee');

    if (!user || !user.isActive) {
      return ApiResponse.error(res, 'Invalid or inactive account', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired. Please login again.', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token', 401);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return ApiResponse.error(res, 'You are not authorized to perform this action', 403);
  }
  return next();
};

export const requirePermission = (permission) => (req, res, next) => {
  if (req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Admin access required', 403);
  }
  if (req.user.permissions?.[permission] === false) {
    return ApiResponse.error(res, 'Insufficient permissions', 403);
  }
  return next();
};
