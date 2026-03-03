/**
 * Link Model — important bookmarks with category + tags
 */
const mongoose = require('mongoose');

const CATEGORIES = ['DSA Problems', 'YouTube', 'Articles', 'Coding Platforms', 'Documentation', 'Research', 'Other'];

const linkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  url: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  category: { type: String, enum: CATEGORIES, default: 'Other' },
  tags: [{ type: String, trim: true, maxlength: 30 }],
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

linkSchema.index({ user: 1, category: 1 });
linkSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.models.Link || mongoose.model('Link', linkSchema);
