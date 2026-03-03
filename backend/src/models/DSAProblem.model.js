// ============================================================
// DSA Problem Tracker Model
// ============================================================
const mongoose = require('mongoose');

const DSAProblemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Problem title required'], trim: true, maxlength: 300 },
  url: { type: String, trim: true, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String, trim: true, maxlength: 100, default: '' },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  notes: { type: String, trim: true, default: '' }
}, { timestamps: true });

DSAProblemSchema.index({ user: 1, status: 1 });
DSAProblemSchema.index({ user: 1, difficulty: 1 });

module.exports = mongoose.models.DSAProblem || mongoose.model('DSAProblem', DSAProblemSchema);
