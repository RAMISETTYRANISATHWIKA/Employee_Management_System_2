import { Router } from 'express';
import {
  getHolidays,
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from '../controllers/holidayController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getHolidays);
router.get('/all', authorize('admin'), requirePermission('manageHolidays'), getAllHolidays);
router.post('/', authorize('admin'), requirePermission('manageHolidays'), createHoliday);
router.put('/:id', authorize('admin'), requirePermission('manageHolidays'), updateHoliday);
router.delete('/:id', authorize('admin'), requirePermission('manageHolidays'), deleteHoliday);

export default router;
