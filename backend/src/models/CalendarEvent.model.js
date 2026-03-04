// ============================================================
// Calendar Event Model
// ============================================================
const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Event title required'], trim: true, maxlength: 200 },
  date: { type: Date, required: [true, 'Event date required'] },
  time: { type: String, default: '' }, // "HH:MM" string
  type: {
    type: String,
    enum: ['study', 'assignment', 'exam', 'reminder', 'other'],
    default: 'study'
  },
  description: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

CalendarEventSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
