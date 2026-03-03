const Habit = require('../models/Habit.model');

exports.getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id });
        res.json({ success: true, data: habits });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createHabit = async (req, res) => {
    try {
        const habit = await Habit.create({ ...req.body, user: req.user.id });
        res.status(201).json({ success: true, data: habit });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.toggleHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
        if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

        const today = new Date().toISOString().split('T')[0];
        const index = habit.completedDates.indexOf(today);

        if (index > -1) {
            habit.completedDates.splice(index, 1);
        } else {
            habit.completedDates.push(today);
        }

        await habit.save();
        res.json({ success: true, data: habit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
        res.json({ success: true, message: 'Habit deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
