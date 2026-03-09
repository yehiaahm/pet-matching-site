import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  activeAnnouncement,
  adminAnnouncements,
  adminCreateAnnouncement,
  adminDelete,
  adminDeleteAnnouncement,
  adminList,
  adminSend,
  adminToggleAnnouncement,
  adminWarning,
  deleteAll,
  deleteOne,
  listNotifications,
  markAllRead,
  markRead,
  syncHealthAlerts,
  unreadCount,
} from '../controllers/notificationController.js';

const router = Router();

router.use(protect);

router.get('/', asyncHandler(listNotifications));
router.post('/health-alerts/sync', asyncHandler(syncHealthAlerts));
router.get('/unread-count', asyncHandler(unreadCount));
router.patch('/read-all', asyncHandler(markAllRead));
router.patch('/:id/read', asyncHandler(markRead));
router.delete('/all', asyncHandler(deleteAll));
router.delete('/:id', asyncHandler(deleteOne));
router.get('/announcements/active', asyncHandler(activeAnnouncement));

router.post('/admin/send', asyncHandler(adminSend));
router.post('/admin/warning', asyncHandler(adminWarning));
router.get('/admin/list', asyncHandler(adminList));
router.delete('/admin/:id', asyncHandler(adminDelete));
router.get('/admin/announcements', asyncHandler(adminAnnouncements));
router.post('/admin/announcements', asyncHandler(adminCreateAnnouncement));
router.patch('/admin/announcements/:id', asyncHandler(adminToggleAnnouncement));
router.delete('/admin/announcements/:id', asyncHandler(adminDeleteAnnouncement));

export default router;
