import { Router } from 'express';
import {
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  markAsRead,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.get('/all', authorize('admin'), requirePermission('manageAnnouncements'), getAllAnnouncements);
router.post('/', authorize('admin'), requirePermission('manageAnnouncements'), createAnnouncement);
router.put('/:id', authorize('admin'), requirePermission('manageAnnouncements'), updateAnnouncement);
router.patch('/:id/read', markAsRead);
router.delete('/:id', authorize('admin'), requirePermission('manageAnnouncements'), deleteAnnouncement);

export default router;
