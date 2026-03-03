// ============================================================
// Auth Controller - Register / Login / Profile
// ============================================================
const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return errorResponse(res, 'Name, email, and password are required', 400);
    if (await User.findOne({ email }))
      return errorResponse(res, 'Email already registered', 409);
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    return successResponse(res, { token, user: { _id: user._id, name: user.name, email: user.email, theme: user.theme } }, 'Account created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 'Email and password required', 400);
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return errorResponse(res, 'Invalid email or password', 401);
    const token = generateToken(user._id);
    return successResponse(res, { token, user: { _id: user._id, name: user.name, email: user.email, theme: user.theme } }, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    return successResponse(res, req.user, 'User profile fetched');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, theme } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (theme) updates.theme = theme;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return successResponse(res, user, 'Profile updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return errorResponse(res, 'Current password incorrect', 400);
    user.password = newPassword;
    await user.save();
    return successResponse(res, null, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
