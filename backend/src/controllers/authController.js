/**
 * Auth Controller
 * Handles signup, login, refresh, logout, and profile
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ── Token helpers ──────────────────────────────────────
const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
};

const sendTokens = (res, user, statusCode = 200, message = 'Success') => {
  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  res.cookie('accessToken', accessToken, cookieOpts);
  res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
  sendSuccess(res, statusCode, message, { user: user.toPublic(), accessToken });
};

// ── POST /api/auth/signup ──────────────────────────────
exports.signup = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create({ name, email, password });
  logger.info(`New user registered: ${email}`);
  sendTokens(res, user, 201, 'Account created successfully');
});

// ── POST /api/auth/login ───────────────────────────────
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +isActive');
  if (!user || !user.isActive) throw new AppError('Invalid email or password', 401);

  const valid = await user.comparePassword(password);
  if (!valid) throw new AppError('Invalid email or password', 401);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  logger.info(`User logged in: ${email}`);
  sendTokens(res, user, 200, 'Login successful');
});

// ── POST /api/auth/refresh ─────────────────────────────
exports.refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new AppError('No refresh token', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Refresh token invalid or expired', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User not found', 401);

  const accessToken = signAccess(user._id);
  res.cookie('accessToken', accessToken, cookieOpts);
  sendSuccess(res, 200, 'Token refreshed', { accessToken });
});

// ── POST /api/auth/logout ──────────────────────────────
exports.logout = catchAsync(async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  sendSuccess(res, 200, 'Logged out successfully');
});

// ── GET /api/auth/me ───────────────────────────────────
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, 200, 'Profile fetched', { user: user.toPublic() });
});

// ── PATCH /api/auth/me ─────────────────────────────────
exports.updateMe = catchAsync(async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true, runValidators: true });
  sendSuccess(res, 200, 'Profile updated', { user: user.toPublic() });
});

// ── PATCH /api/auth/change-password ────────────────────
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!await user.comparePassword(currentPassword)) throw new AppError('Current password incorrect', 400);
  user.password = newPassword;
  await user.save();
  sendTokens(res, user, 200, 'Password changed successfully');
});
