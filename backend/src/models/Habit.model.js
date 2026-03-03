const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Habit name required'], trim: true },
    description: { type: String, trim: true },
    icon: { type: String, default: '⭐' },
    color: { type: String, default: '#6366f1' },
    // Date format: YYYY-MM-DD
    completedDates: [{ type: String }],
    streak: { type: Number, default: 0 }
}, { timestamps: true });

// Helper to check if completed today
HabitSchema.methods.isCompletedToday = function () {
    const today = new Date().toISOString().split('T')[0];
    return this.completedDates.includes(today);
};

module.exports = mongoose.model('Habit', HabitSchema);
