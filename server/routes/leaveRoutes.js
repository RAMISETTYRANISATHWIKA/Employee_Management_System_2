import { Router } from 'express';
import { body } from 'express-validator';
import {
  createLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} from '../controllers/leaveController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('staff'),
  [
    body('leaveType').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('reason').notEmpty(),
  ],
  validate,
  createLeave
);

router.get('/my', authorize('staff'), getMyLeaves);
router.get('/', authorize('admin'), requirePermission('manageLeaves'), getAllLeaves);
router.patch('/:id/review', authorize('admin'), requirePermission('manageLeaves'), reviewLeave);
router.patch('/:id/cancel', authorize('staff'), cancelLeave);

export default router;
