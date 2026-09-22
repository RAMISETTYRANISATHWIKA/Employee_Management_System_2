import { Router } from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getEmployeeLeaves,
} from '../controllers/employeeController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), requirePermission('manageEmployees'), getEmployees);
router.get('/:id', getEmployee);
router.get('/:id/leaves', authorize('admin'), getEmployeeLeaves);
router.post('/', authorize('admin'), requirePermission('manageEmployees'), createEmployee);
router.put('/:id', updateEmployee);
router.patch('/:id/toggle-status', authorize('admin'), requirePermission('manageEmployees'), toggleEmployeeStatus);

export default router;
