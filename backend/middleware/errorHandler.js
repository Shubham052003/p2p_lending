const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose: bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(`Resource not found`, 404);
  }
  // Mongoose: duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(`${field} already exists`, 400);
  }
  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(', ');
    error = new ApiError(msg, 400);
  }
  // JWT expired
  if (err.name === 'TokenExpiredError') {
    error = new ApiError('Session expired. Please log in again.', 401);
  }
  // JWT invalid
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('Invalid token. Please log in again.', 401);
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;