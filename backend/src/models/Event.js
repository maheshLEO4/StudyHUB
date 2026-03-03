/**
 * Calendar Event Model
 */
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000 },
  date:        { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },  // ISO date YYYY-MM-DD
  time:        { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },     // HH:MM optional
  type:        { type: String, enum: ['study','exam','assignment','reminder'], default: 'study' },
  allDay:      { type: Boolean, default: true },
  color:       { type: String },
  reminder:    { type: Number },   // minutes before event
}, { timestamps: true });

eventSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
