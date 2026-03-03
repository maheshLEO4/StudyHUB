// ============================================================
// Task Model
// ============================================================
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:          { type: String, required: [true, 'Task title required'], trim: true, maxlength: 300 },
  checklist_name: { type: String, trim: true, default: 'General' },
  priority:       { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  due_date:       { type: Date },
  completed:      { type: Boolean, default: false },
  completed_at:   { type: Date }
}, { timestamps: true });

TaskSchema.pre('save', function (next) {
  if (this.isModified('completed') && this.completed) {
    this.completed_at = new Date();
  } else if (this.isModified('completed') && !this.completed) {
    this.completed_at = undefined;
  }
  next();
});

TaskSchema.index({ user: 1, completed: 1 });
TaskSchema.index({ user: 1, due_date: 1 });

module.exports = mongoose.model('Task', TaskSchema);
