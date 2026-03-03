/**
 * DSA Problem Tracker Controller
 */
const DSAProblem = require('../models/DSAProblem');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

exports.getProblems = catchAsync(async (req, res) => {
  const { status, difficulty, topic, search, page = 1, limit = 100 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;
  if (difficulty) query.difficulty = difficulty;
  if (topic) query.topic = { $regex: topic, $options: 'i' };
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { topic: { $regex: search, $options: 'i' } },
  ];
  const skip = (page - 1) * limit;
  const [problems, total] = await Promise.all([
    DSAProblem.find(query).sort({ status: 1, createdAt: -1 }).skip(skip).limit(+limit),
    DSAProblem.countDocuments(query),
  ]);

  // Stats
  const stats = await DSAProblem.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  sendSuccess(res, 200, 'Problems fetched', problems, { total, stats });
});

exports.createProblem = catchAsync(async (req, res) => {
  const problem = await DSAProblem.create({ ...req.body, user: req.user._id });
  sendSuccess(res, 201, 'Problem added', problem);
});

exports.updateProblem = catchAsync(async (req, res) => {
  const problem = await DSAProblem.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!problem) throw new AppError('Problem not found', 404);
  sendSuccess(res, 200, 'Problem updated', problem);
});

exports.deleteProblem = catchAsync(async (req, res) => {
  const problem = await DSAProblem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!problem) throw new AppError('Problem not found', 404);
  sendSuccess(res, 200, 'Problem deleted');
});
