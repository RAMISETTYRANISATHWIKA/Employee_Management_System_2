import { Router } from 'express';
import { body } from 'express-validator';
import { login, getMe, changePassword, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/login',
  loginLimiter,
  [
    body('identifier').notEmpty().withMessage('Email or Employee ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['admin', 'staff']).withMessage('Invalid role'),
  ],
  validate,
  login
);

router.get('/me', authenticate, getMe);

router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  changePassword
);

router.post('/logout', authenticate, logout);

export default router;
