// ============================================================
// DSA Problem Tracker Controller
// ============================================================
const DSAProblem = require('../models/DSAProblem.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

const getProblems = async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.difficulty && req.query.difficulty !== 'All') query.difficulty = req.query.difficulty;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { topic: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const problems = await DSAProblem.find(query).sort({ createdAt: -1 });
    return successResponse(res, problems);
  } catch (err) { return errorResponse(res, err.message); }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, easy, medium, hard, notStarted, inProgress, completed] = await Promise.all([
      DSAProblem.countDocuments({ user: userId }),
      DSAProblem.countDocuments({ user: userId, difficulty: 'Easy' }),
      DSAProblem.countDocuments({ user: userId, difficulty: 'Medium' }),
      DSAProblem.countDocuments({ user: userId, difficulty: 'Hard' }),
      DSAProblem.countDocuments({ user: userId, status: 'Not Started' }),
      DSAProblem.countDocuments({ user: userId, status: 'In Progress' }),
      DSAProblem.countDocuments({ user: userId, status: 'Completed' })
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
