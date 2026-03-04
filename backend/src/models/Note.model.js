// ============================================================
// Note Model
// ============================================================
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: [true, 'Note title required'], trim: true, maxlength: 200 },
  content: { type: String, default: '' },       // HTML rich text content
  important: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
  file_urls: [{ type: String }]                   // stored file URLs
}, { timestamps: true });

NoteSchema.index({ user: 1, subject: 1 });
NoteSchema.index({ user: 1, title: 'text', content: 'text' }); // text search

module.exports = mongoose.model('Note', NoteSchema);
