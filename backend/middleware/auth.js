const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const ApiError = require('../utils/ApiError');

// Verifies JWT and attaches req.user
exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      return next(new ApiError('Not authorised. Please log in.', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new ApiError('User no longer exists.', 401));
    if (!user.isActive) return next(new ApiError('Account deactivated.', 401));
    req.user = user;
    next();
  } catch (err) {
    next(err);   // errorHandler catches JWT errors by name
  }
};

// Role-based access guard — pass one or more allowed roles
exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new ApiError(
        `Access denied. Only ${roles.join(' or ')} can perform this action.`,
        403
      )
    );
  }
  next();
};