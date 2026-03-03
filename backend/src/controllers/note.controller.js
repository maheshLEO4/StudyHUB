// ============================================================
// Note Controller
// ============================================================
const Note    = require('../models/Note.model');
const Subject = require('../models/Subject.model');
const path    = require('path');
const { successResponse, errorResponse } = require('../utils/response.utils');

// GET /api/notes?subject=id&important=true
const getNotes = async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.subject) query.subject = req.query.subject;
    if (req.query.important === 'true') query.is_important = true;
    const notes = await Note.find(query).sort({ createdAt: -1 });
    return successResponse(res, notes);
  } catch (err) { return errorResponse(res, err.message); }
};

// GET /api/notes/:id
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).populate('subject', 'name color icon');
    if (!note) return errorResponse(res, 'Note not found', 404);
    return successResponse(res, note);
  } catch (err) { return errorResponse(res, err.message); }
};

// POST /api/notes
const createNote = async (req, res) => {
  try {
    const { title, content, subject, is_important, tags, file_urls } = req.body;
    if (!title) return errorResponse(res, 'Title required', 400);
    if (!subject) return errorResponse(res, 'Subject required', 400);
    const subjectDoc = await Subject.findOne({ _id: subject, user: req.user._id });
    if (!subjectDoc) return errorResponse(res, 'Subject not found', 404);
    const note = await Note.create({ user: req.user._id, subject, title, content, is_important, tags, file_urls });
    return successResponse(res, note, 'Note created', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

// PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!note) return errorResponse(res, 'Note not found', 404);
    return successResponse(res, note, 'Note updated');
  } catch (err) { return errorResponse(res, err.message); }
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return errorResponse(res, 'Note not found', 404);
    return successResponse(res, null, 'Note deleted');
  } catch (err) { return errorResponse(res, err.message); }
};

// POST /api/notes/upload - Upload file attachment
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);
    const fileUrl = `/uploads/${req.file.filename}`;
    return successResponse(res, {
      file_url: fileUrl,
      original_name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, 'File uploaded');
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote, uploadFile };
