// ============================================================
// Link / Bookmark Model
// ============================================================
const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Link title required'], trim: true, maxlength: 200 },
  url: { type: String, required: [true, 'URL required'], trim: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  category: {
    type: String,
    enum: ['DSA Problems', 'YouTube', 'Articles', 'Coding Platforms', 'Documentation', 'Other'],
    default: 'Other'
  },
  tags: [{ type: String, trim: true }]
}, { timestamps: true });

LinkSchema.index({ user: 1, category: 1 });

module.exports = mongoose.models.Link || mongoose.model('Link', LinkSchema);
