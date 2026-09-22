import Announcement from '../models/Announcement.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const { search, priority, page = 1, limit = 10 } = req.query;
    const filter = { isPublished: true, isArchived: false };

    if (req.user.role === 'staff') {
      filter.$or = [{ audience: 'all' }, { audience: 'staff' }];
      if (req.user.employee?.department) {
        filter.$or.push({
          audience: 'department',
          targetDepartment: req.user.employee.department,
        });
      }
    }

    if (search) filter.title = new RegExp(search, 'i');
    if (priority) filter.priority = priority;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('author', 'email')
        .sort('-publicationDate')
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Announcement.countDocuments(filter),
    ]);

    const enriched = announcements.map((a) => ({
      ...a.toObject(),
      isRead: a.readBy.some((id) => id.toString() === req.user._id.toString()),
    }));

    return ApiResponse.success(res, 'Announcements fetched', {
      announcements: enriched,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [announcements, total] = await Promise.all([
      Announcement.find().populate('author', 'email').sort('-createdAt').skip(skip).limit(parseInt(limit, 10)),
      Announcement.countDocuments(),
    ]);

    return ApiResponse.success(res, 'All announcements fetched', {
      announcements,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({ ...req.body, author: req.user._id });
    return ApiResponse.success(res, 'Announcement created', { announcement }, 201);
  } catch (error) {
    return next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!announcement) return ApiResponse.error(res, 'Announcement not found', 404);
    return ApiResponse.success(res, 'Announcement updated', { announcement });
  } catch (error) {
    return next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return ApiResponse.error(res, 'Announcement not found', 404);

    if (!announcement.readBy.includes(req.user._id)) {
      announcement.readBy.push(req.user._id);
      await announcement.save();
    }

    return ApiResponse.success(res, 'Marked as read');
  } catch (error) {
    return next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, isPublished: false },
      { new: true }
    );
    if (!announcement) return ApiResponse.error(res, 'Announcement not found', 404);
    return ApiResponse.success(res, 'Announcement archived', { announcement });
  } catch (error) {
    return next(error);
  }
};
