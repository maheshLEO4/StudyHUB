/**
 * Todo / Checklist Task Model
 */
const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  color:{ type: String, default: '#c8521a' },
  order:{ type: Number, default: 0 },
}, { timestamps: true });

const todoSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  checklist:   { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist', default: null },
  text:        { type: String, required: true, trim: true, maxlength: 500 },
  done:        { type: Boolean, default: false },
  dueDate:     { type: String },
  priority:    { type: String, enum: ['low','medium','high'], default: 'medium' },
  completedAt: { type: Date },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

todoSchema.index({ user: 1, done: 1 });
todoSchema.index({ user: 1, checklist: 1 });

todoSchema.pre('save', function (next) {
  if (this.isModified('done')) {
    this.completedAt = this.done ? new Date() : undefined;
  }
  next();
});

const Checklist = mongoose.model('Checklist', checklistSchema);
const Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo, Checklist };
