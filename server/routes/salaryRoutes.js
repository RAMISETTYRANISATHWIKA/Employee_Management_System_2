import { Router } from 'express';
import {
  getMySalaries,
  getAllSalaries,
  createSalary,
  updateSalaryStatus,
} from '../controllers/salaryController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my', authorize('staff'), getMySalaries);
router.get('/', authorize('admin'), requirePermission('manageSalaries'), getAllSalaries);
router.post('/', authorize('admin'), requirePermission('manageSalaries'), createSalary);
router.patch('/:id/status', authorize('admin'), requirePermission('manageSalaries'), updateSalaryStatus);

export default router;
