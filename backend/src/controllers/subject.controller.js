// ============================================================
// Subject Controller
// ============================================================
const Subject = require('../models/Subject.model');
const Note    = require('../models/Note.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

// GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: -1 });
    // Attach note count to each subject
    const withCounts = await Promise.all(subjects.map(async (s) => {
      const noteCount = await Note.countDocuments({ subject: s._id });
      return { ...s.toObject(), noteCount };
    }));
    return successResponse(res, withCounts);
  } catch (err) { return errorResponse(res, err.message); }
};

// GET /api/subjects/:id
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return errorResponse(res, 'Subject not found', 404);
    return successResponse(res, subject);
  } catch (err) { return errorResponse(res, err.message); }
};

// POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) return errorResponse(res, 'Subject name is required', 400);
    const subject = await Subject.create({ user: req.user._id, name, description, color, icon });
    return successResponse(res, subject, 'Subject created', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!subject) return errorResponse(res, 'Subject not found', 404);
    return successResponse(res, subject, 'Subject updated');
  } catch (err) { return errorResponse(res, err.message); }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return errorResponse(res, 'Subject not found', 404);
    // Cascade delete all notes
    await Note.deleteMany({ subject: subject._id });
    await subject.deleteOne();
    return successResponse(res, null, 'Subject and all its notes deleted');
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };
