// ============================================================
// DSA Problem Tracker Controller
// ============================================================
const DSAProblem = require('../models/DSAProblem.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

const getProblems = async (req, res) => {
  try {
    const userId = req.user._id;
    const query = { user: userId };
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status.toLowerCase();
    if (req.query.difficulty && req.query.difficulty !== 'All') query.difficulty = req.query.difficulty.toLowerCase();
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { topic: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const [problems, stats] = await Promise.all([
      DSAProblem.find(query).sort({ createdAt: -1 }),
      DSAProblem.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const statsObj = { 'not-started': 0, 'in-progress': 0, completed: 0, total: 0 };
    stats.forEach(s => {
      if (s._id) {
        statsObj[s._id] = s.count;
        statsObj.total += s.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: problems,
      meta: { stats: statsObj }
    });
  } catch (err) { return errorResponse(res, err.message); }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, easy, medium, hard, notStarted, inProgress, completed] = await Promise.all([
      DSAProblem.countDocuments({ user: userId }),
      DSAProblem.countDocuments({ user: userId, difficulty: 'easy' }),
      DSAProblem.countDocuments({ user: userId, difficulty: 'medium' }),
      DSAProblem.countDocuments({ user: userId, difficulty: 'hard' }),
      DSAProblem.countDocuments({ user: userId, status: 'not-started' }),
      DSAProblem.countDocuments({ user: userId, status: 'in-progress' }),
      DSAProblem.countDocuments({ user: userId, status: 'completed' })
    ]);
    return successResponse(res, { total, easy, medium, hard, notStarted, inProgress, completed });
  } catch (err) { return errorResponse(res, err.message); }
};

const createProblem = async (req, res) => {
  try {
    const { title, url, difficulty, topic, status, notes } = req.body;
    if (!title) return errorResponse(res, 'Problem title required', 400);
    const problem = await DSAProblem.create({ user: req.user._id, title, url, difficulty, topic, status, notes });
    return successResponse(res, problem, 'Problem added', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

const updateProblem = async (req, res) => {
  try {
    const problem = await DSAProblem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!problem) return errorResponse(res, 'Problem not found', 404);
    return successResponse(res, problem, 'Problem updated');
  } catch (err) { return errorResponse(res, err.message); }
};

const deleteProblem = async (req, res) => {
  try {
    const problem = await DSAProblem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!problem) return errorResponse(res, 'Problem not found', 404);
    return successResponse(res, null, 'Problem deleted');
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { getProblems, getStats, createProblem, updateProblem, deleteProblem };
