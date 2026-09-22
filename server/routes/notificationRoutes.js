import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllRead);

export default router;
