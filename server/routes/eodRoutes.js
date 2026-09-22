import { Router } from 'express';
import {
  createEOD,
  getMyEODs,
  getAllEODs,
  reviewEOD,
  updateEOD,
} from '../controllers/eodController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('staff'), createEOD);
router.get('/my', authorize('staff'), getMyEODs);
router.get('/', authorize('admin'), requirePermission('viewEODReports'), getAllEODs);
router.put('/:id', authorize('staff'), updateEOD);
router.patch('/:id/review', authorize('admin'), requirePermission('viewEODReports'), reviewEOD);

export default router;
