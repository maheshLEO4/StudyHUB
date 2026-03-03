// ============================================================
// Subject Model
// ============================================================
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Subject name is required'], trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  color: { type: String, default: '#6c63ff' },
  icon: { type: String, default: '📚' }
}, { timestamps: true });

SubjectSchema.index({ user: 1, name: 1 });

module.exports = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
