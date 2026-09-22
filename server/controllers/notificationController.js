import Notification from '../models/Notification.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit, 10)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return ApiResponse.success(res, 'Notifications fetched', {
      notifications,
      unreadCount,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return ApiResponse.error(res, 'Notification not found', 404);
    return ApiResponse.success(res, 'Notification marked as read', { notification });
  } catch (error) {
    return next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return ApiResponse.success(res, 'All notifications marked as read');
  } catch (error) {
    return next(error);
  }
};
