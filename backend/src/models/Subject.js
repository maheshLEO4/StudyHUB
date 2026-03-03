/**
 * Subject Model
 * Each user owns multiple subjects; notes are embedded for atomicity.
 */
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, default: '' },
  important: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

const fileSchema = new mongoose.Schema({
  originalName: String,
  storedName: String,
  mimetype: String,
  size: Number,
  path: String,
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  color: { type: String, default: '#c8521a', match: /^#[0-9A-Fa-f]{6}$/ },
  icon: { type: String, default: 'book' },
  notes: [noteSchema],
  files: [fileSchema],
  order: { type: Number, default: 0 },
}, { timestamps: true });

subjectSchema.index({ user: 1, name: 1 });

// Virtual: note count
subjectSchema.virtual('noteCount').get(function () { return this.notes.length; });

module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
