/**
 * Todo & Checklist Controller
 */
const { Todo, Checklist } = require('../models/Todo');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// ── Checklists ─────────────────────────────────────────
exports.getChecklists = catchAsync(async (req, res) => {
  const checklists = await Checklist.find({ user: req.user._id }).sort({ order: 1 });
  sendSuccess(res, 200, 'Checklists fetched', checklists);
});

exports.createChecklist = catchAsync(async (req, res) => {
  const cl = await Checklist.create({ ...req.body, user: req.user._id });
  sendSuccess(res, 201, 'Checklist created', cl);
});

exports.updateChecklist = catchAsync(async (req, res) => {
  const cl = await Checklist.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, req.body, { new: true }
  );
  if (!cl) throw new AppError('Checklist not found', 404);
  sendSuccess(res, 200, 'Checklist updated', cl);
});

exports.deleteChecklist = catchAsync(async (req, res) => {
  const cl = await Checklist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!cl) throw new AppError('Checklist not found', 404);
  // Remove all todos in this checklist
  await Todo.deleteMany({ checklist: req.params.id, user: req.user._id });
  sendSuccess(res, 200, 'Checklist and its tasks deleted');
});

// ── Todos ──────────────────────────────────────────────
exports.getTodos = catchAsync(async (req, res) => {
  const { checklist, done, priority, search } = req.query;
  const query = { user: req.user._id };
  if (checklist) query.checklist = checklist === 'none' ? null : checklist;
  if (done !== undefined) query.done = done === 'true';
  if (priority) query.priority = priority;
  if (search) query.text = { $regex: search, $options: 'i' };
  const todos = await Todo.find(query).sort({ done: 1, priority: -1, order: 1, createdAt: -1 });
  sendSuccess(res, 200, 'Todos fetched', todos);
});

exports.createTodo = catchAsync(async (req, res) => {
  const todo = await Todo.create({ ...req.body, user: req.user._id });
  sendSuccess(res, 201, 'Task created', todo);
});

exports.updateTodo = catchAsync(async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
  );
  if (!todo) throw new AppError('Task not found', 404);
  sendSuccess(res, 200, 'Task updated', todo);
});

exports.deleteTodo = catchAsync(async (req, res) => {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!todo) throw new AppError('Task not found', 404);
  sendSuccess(res, 200, 'Task deleted');
});
