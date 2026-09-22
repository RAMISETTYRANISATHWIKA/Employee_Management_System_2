import { ApiResponse } from '../utils/ApiResponse.js';

export const notFound = (req, res) => {
  ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, err.message, 422);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return ApiResponse.error(res, `Duplicate value for ${field}`, 409);
  }

  if (err.name === 'CastError') {
    return ApiResponse.error(res, 'Invalid resource identifier', 400);
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  return ApiResponse.error(res, message, statusCode);
};
