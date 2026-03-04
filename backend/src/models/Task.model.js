// ============================================================
// Task Model
// ============================================================
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: [true, 'Task text required'], trim: true, maxlength: 300 },
  checklist: { type: String, trim: true }, // Store name or ID
  priority: { type: String, enum: ['low', 'medium', 'high', 'Low', 'Medium', 'High'], default: 'medium' },
  dueDate: { type: String }, // Storing as string to match frontend 'YYYY-MM-DD'
  done: { type: Boolean, default: false },
  completed_at: { type: Date }
}, { timestamps: true });

TaskSchema.pre('save', function (next) {
  if (this.isModified('done') && this.done) {
    this.completed_at = new Date();
  } else if (this.isModified('done') && !this.done) {
    this.completed_at = undefined;
  }
  next();
});

TaskSchema.index({ user: 1, done: 1 });
TaskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);
