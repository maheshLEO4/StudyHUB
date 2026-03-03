/**
 * DSA Problem Tracker Model
 */
const mongoose = require('mongoose');

const dsaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  url: { type: String, trim: true },
  topic: { type: String, trim: true, maxlength: 100 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
  notes: { type: String, trim: true, maxlength: 2000 },
  solvedAt: { type: Date },
}, { timestamps: true });

dsaSchema.index({ user: 1, status: 1 });
dsaSchema.index({ user: 1, difficulty: 1 });

// Auto-set solvedAt when status changes to completed
dsaSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.solvedAt) {
    this.solvedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'completed') {
    this.solvedAt = undefined;
  }
  next();
});

module.exports = mongoose.models.DSAProblem || mongoose.model('DSAProblem', dsaSchema);
