import Holiday from '../models/Holiday.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getHolidays = async (req, res, next) => {
  try {
    const { year, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };

    if (year) {
      filter.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [holidays, total] = await Promise.all([
      Holiday.find(filter).sort('date').skip(skip).limit(parseInt(limit, 10)),
      Holiday.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Holidays fetched', {
      holidays,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().sort('date');
    return ApiResponse.success(res, 'All holidays fetched', { holidays });
  } catch (error) {
    return next(error);
  }
};

export const createHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.create({ ...req.body, createdBy: req.user._id });
    return ApiResponse.success(res, 'Holiday created', { holiday }, 201);
  } catch (error) {
    return next(error);
  }
};

export const updateHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!holiday) return ApiResponse.error(res, 'Holiday not found', 404);
    return ApiResponse.success(res, 'Holiday updated', { holiday });
  } catch (error) {
    return next(error);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) return ApiResponse.error(res, 'Holiday not found', 404);

    if (new Date(holiday.date) <= new Date()) {
      return ApiResponse.error(res, 'Cannot delete past holidays', 400);
    }

    await holiday.deleteOne();
    return ApiResponse.success(res, 'Holiday deleted');
  } catch (error) {
    return next(error);
  }
};
