import { Router } from 'express';
import { getDashboardStats, getAuditLogs } from '../controllers/reportController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/audit-logs', authorize('admin'), requirePermission('viewAuditLogs'), getAuditLogs);

export default router;
