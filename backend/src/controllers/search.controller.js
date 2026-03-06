const Subject = require('../models/Subject.model');
const Note = require('../models/Note.model');
const Link = require('../models/Link.model');
const DSAProblem = require('../models/DSAProblem.model');
const Task = require('../models/Task.model');
const CalendarEvent = require('../models/CalendarEvent.model');
const Habit = require('../models/Habit.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return errorResponse(res, 'Search query too short', 400);
    const regex = new RegExp(q.trim(), 'i');
    const userId = req.user._id;

    const [subjects, notes, links, problems, tasks] = await Promise.all([
      Subject.find({ user: userId, $or: [{ name: regex }, { description: regex }] }).limit(5),
      Note.find({ user: userId, $or: [{ title: regex }, { content: regex }, { tags: regex }] }).populate('subject', 'name color').limit(8),
      Link.find({ user: userId, $or: [{ title: regex }, { description: regex }, { tags: regex }] }).limit(5),
      DSAProblem.find({ user: userId, $or: [{ title: regex }, { topic: regex }] }).limit(5),
      Task.find({ user: userId, title: regex }).limit(5)
    ]);

    return successResponse(res, { subjects, notes, links, problems, tasks, query: q });
  } catch (err) { return errorResponse(res, err.message); }
};

const dashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const [subjects, links, dsaStats, pendingTasks, upcomingEvents, recentNotes, habits] = await Promise.all([
      Subject.countDocuments({ user: userId }),
      Link.countDocuments({ user: userId }),
      DSAProblem.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.find({ user: userId, completed: false }).sort({ createdAt: -1 }).limit(5),
      CalendarEvent.find({ user: userId, date: { $gte: today } }).sort({ date: 1 }).limit(3),
      Note.find({ user: userId }).sort({ updatedAt: -1 }).populate('subject', 'name color').limit(3),
      Habit.find({ user: userId }).limit(10)
    ]);

    const dsa = { total: 0, 'not-started': 0, 'in-progress': 0, completed: 0 };
    dsaStats.forEach(s => {
      dsa[s._id] = s.count;
      dsa.total += s.count;
    });

    // Process habits for dashboard
    const habitStats = {
      total: habits.length,
      completed: habits.filter(h => h.completedDates.includes(todayStr)).length,
      list: habits.map(h => ({
        _id: h._id,
        name: h.name,
        completedToday: h.completedDates.includes(todayStr)
      }))
    };

    return successResponse(res, {
      subjects,
      links,
      dsa,
      pendingTasks: {
        count: await Task.countDocuments({ user: userId, completed: false }),
        list: pendingTasks
      },
      upcomingEvents,
      recentNotes,
      habits: habitStats
    });
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { globalSearch, dashboardStats };

