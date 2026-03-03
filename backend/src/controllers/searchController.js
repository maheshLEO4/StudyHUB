/**
 * Global Search Controller
 * Searches across subjects/notes, links, DSA problems, and todos
 */
const Subject = require('../models/Subject');
const Link = require('../models/Link');
const DSAProblem = require('../models/DSAProblem');
const { Todo } = require('../models/Todo');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

exports.globalSearch = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return sendSuccess(res, 200, 'Search results', { subjects: [], notes: [], links: [], problems: [], todos: [] });
  }
  const regex = { $regex: q, $options: 'i' };
  const userId = req.user._id;

  const [subjects, links, problems, todos] = await Promise.all([
    Subject.find({ user: userId, $or: [{ name: regex }, { description: regex }] }).select('name description color').limit(10),
    Link.find({ user: userId, $or: [{ title: regex }, { description: regex }, { tags: regex }] }).limit(10),
    DSAProblem.find({ user: userId, $or: [{ title: regex }, { topic: regex }] }).limit(10),
    Todo.find({ user: userId, text: regex }).limit(10),
  ]);

  // Also search embedded notes
  const subjectsWithNotes = await Subject.find({ user: userId, 'notes.title': regex }).select('name color notes.$');
  const notes = subjectsWithNotes.flatMap((s) =>
    s.notes.filter((n) => regex.test ? n.title.match(new RegExp(q, 'i')) || n.content.match(new RegExp(q, 'i')) : true)
      .slice(0, 5)
      .map((n) => ({ ...n.toObject(), subjectName: s.name, subjectColor: s.color, subjectId: s._id }))
  ).slice(0, 10);

  sendSuccess(res, 200, 'Search results', { subjects, notes, links, problems, todos });
});

exports.dashboardStats = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().slice(0, 10);

  const [subjectCount, linkCount, dsaStats, pendingTodos, upcomingEvents] = await Promise.all([
    Subject.countDocuments({ user: userId }),
    require('../models/Link').countDocuments({ user: userId }),
    DSAProblem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Todo.countDocuments({ user: userId, done: false }),
    require('../models/Event').find({ user: userId, date: { $gte: today } }).sort({ date: 1 }).limit(5),
  ]);

  const dsaMap = {};
  dsaStats.forEach((s) => { dsaMap[s._id] = s.count; });

  sendSuccess(res, 200, 'Dashboard stats', {
    subjects: subjectCount,
    links: linkCount,
    dsa: { total: Object.values(dsaMap).reduce((a, b) => a + b, 0), ...dsaMap },
    pendingTasks: pendingTodos,
    upcomingEvents,
  });
});
