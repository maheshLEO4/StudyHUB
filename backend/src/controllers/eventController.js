/**
 * Calendar Event Controller
 */
const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

exports.getEvents = catchAsync(async (req, res) => {
  const { from, to, type } = req.query;
  const query = { user: req.user._id };
  if (type) query.type = type;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = from;
    if (to) query.date.$lte = to;
  }
  const events = await Event.find(query).sort({ date: 1 });
  sendSuccess(res, 200, 'Events fetched', events);
});

exports.createEvent = catchAsync(async (req, res) => {
  const event = await Event.create({ ...req.body, user: req.user._id });
  sendSuccess(res, 201, 'Event created', event);
});

exports.updateEvent = catchAsync(async (req, res) => {
  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!event) throw new AppError('Event not found', 404);
  sendSuccess(res, 200, 'Event updated', event);
});

exports.deleteEvent = catchAsync(async (req, res) => {
  const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!event) throw new AppError('Event not found', 404);
  sendSuccess(res, 200, 'Event deleted');
});
