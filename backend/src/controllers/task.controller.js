// ============================================================
// Task Controller
// ============================================================
const Task = require('../models/Task.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

const getTasks = async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.done !== undefined) query.done = req.query.done === 'true';
    if (req.query.checklist) query.checklist = req.query.checklist;
    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });
    return successResponse(res, tasks);
  } catch (err) { return errorResponse(res, err.message); }
};

const createTask = async (req, res) => {
  try {
    const { text, checklist, priority, dueDate } = req.body;
    if (!text) return errorResponse(res, 'Task text required', 400);
    const task = await Task.create({ user: req.user._id, text, checklist, priority, dueDate });
    return successResponse(res, task, 'Task created', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!task) return errorResponse(res, 'Task not found', 404);
    return successResponse(res, task, 'Task updated');
  } catch (err) { return errorResponse(res, err.message); }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return errorResponse(res, 'Task not found', 404);
    return successResponse(res, null, 'Task deleted');
  } catch (err) { return errorResponse(res, err.message); }
};

const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return errorResponse(res, 'Task not found', 404);
    task.done = !task.done;
    await task.save();
    return successResponse(res, task, 'Task toggled');
  } catch (err) { return errorResponse(res, err.message); }
};

const getChecklists = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    const names = [...new Set(tasks.map(t => t.checklist).filter(Boolean))];
    const checklists = names.map(name => ({ _id: name, name }));
    return successResponse(res, checklists);
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, toggleTask, getChecklists };
