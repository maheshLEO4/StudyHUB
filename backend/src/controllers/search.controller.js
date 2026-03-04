const Subject = require('../models/Subject.model');
const Note = require('../models/Note.model');
const Link = require('../models/Link.model');
const DSAProblem = require('../models/DSAProblem.model');
const Task = require('../models/Task.model');
const CalendarEvent = require('../models/CalendarEvent.model');
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

    const [subjects, links, dsaStats, pendingTasks, upcomingEvents] = await Promise.all([
      Subject.countDocuments({ user: userId }),
      Link.countDocuments({ user: userId }),
      DSAProblem.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ user: userId, completed: false }),
      CalendarEvent.find({ user: userId, date: { $gte: today } }).sort({ date: 1 }).limit(5)
    ]);

    const dsa = { total: 0, 'not-started': 0, 'in-progress': 0, completed: 0 };
    dsaStats.forEach(s => {
      dsa[s._id] = s.count;
      dsa.total += s.count;
    });

    return successResponse(res, {
      subjects,
      links,
      dsa,
      pendingTasks,
      upcomingEvents
    });
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { globalSearch, dashboardStats };
