/**
 * JWT Authentication Middleware
 * Verifies access token on protected routes
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  // 1) Extract token from header or cookie
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw new AppError('Not authenticated. Please log in.', 401);

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Token is invalid or expired. Please log in again.', 401);
  }

  // 3) Check user still exists
  const user = await User.findById(decoded.id).select('+isActive');
  if (!user || !user.isActive) throw new AppError('User no longer exists.', 401);

  req.user = user;
  next();
});

module.exports = { protect };
