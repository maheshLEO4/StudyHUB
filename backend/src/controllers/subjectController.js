/**
 * Subject Controller — CRUD for subjects + embedded notes/files
 */
const Subject = require('../models/Subject');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// ── GET /api/subjects ──────────────────────────────────
exports.getSubjects = catchAsync(async (req, res) => {
  const subjects = await Subject.find({ user: req.user._id }).sort({ order: 1, createdAt: -1 });
  sendSuccess(res, 200, 'Subjects fetched', subjects);
});

// ── POST /api/subjects ─────────────────────────────────
exports.createSubject = catchAsync(async (req, res) => {
  const { name, description, color, icon } = req.body;
  const subject = await Subject.create({ user: req.user._id, name, description, color, icon });
  sendSuccess(res, 201, 'Subject created', subject);
});

// ── GET /api/subjects/:id ──────────────────────────────
exports.getSubject = catchAsync(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
  if (!subject) throw new AppError('Subject not found', 404);
  sendSuccess(res, 200, 'Subject fetched', subject);
});

// ── PATCH /api/subjects/:id ────────────────────────────
exports.updateSubject = catchAsync(async (req, res) => {
  const { name, description, color, icon, order } = req.body;
  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { name, description, color, icon, order },
    { new: true, runValidators: true }
  );
  if (!subject) throw new AppError('Subject not found', 404);
  sendSuccess(res, 200, 'Subject updated', subject);
});

// ── DELETE /api/subjects/:id ───────────────────────────
exports.deleteSubject = catchAsync(async (req, res) => {
  const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!subject) throw new AppError('Subject not found', 404);
  sendSuccess(res, 200, 'Subject deleted');
});

// ── POST /api/subjects/:id/notes ───────────────────────
exports.addNote = catchAsync(async (req, res) => {
  const { title, content, important, tags } = req.body;
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
  if (!subject) throw new AppError('Subject not found', 404);
  subject.notes.push({ title, content, important, tags });
  await subject.save();
  sendSuccess(res, 201, 'Note added', subject.notes[subject.notes.length - 1]);
});

// ── PATCH /api/subjects/:id/notes/:noteId ──────────────
exports.updateNote = catchAsync(async (req, res) => {
  const { title, content, important, tags } = req.body;
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
  if (!subject) throw new AppError('Subject not found', 404);
  const note = subject.notes.id(req.params.noteId);
  if (!note) throw new AppError('Note not found', 404);
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (important !== undefined) note.important = important;
  if (tags !== undefined) note.tags = tags;
  await subject.save();
  sendSuccess(res, 200, 'Note updated', note);
});

// ── DELETE /api/subjects/:id/notes/:noteId ─────────────
exports.deleteNote = catchAsync(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
  if (!subject) throw new AppError('Subject not found', 404);
  subject.notes.pull({ _id: req.params.noteId });
  await subject.save();
  sendSuccess(res, 200, 'Note deleted');
});
