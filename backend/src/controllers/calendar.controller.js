// ============================================================
// Calendar Event Controller
// ============================================================
const CalendarEvent = require('../models/CalendarEvent.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

const getEvents = async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.month && req.query.year) {
      const year = parseInt(req.query.year), month = parseInt(req.query.month) - 1;
      query.date = { $gte: new Date(year, month, 1), $lte: new Date(year, month + 1, 0, 23, 59, 59) };
    }
    if (req.query.type) query.type = req.query.type;
    const events = await CalendarEvent.find(query).sort({ date: 1 });
    return successResponse(res, events);
  } catch (err) { return errorResponse(res, err.message); }
};

const getUpcoming = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const events = await CalendarEvent.find({
      user: req.user._id,
      date: { $gte: new Date() }
    }).sort({ date: 1 }).limit(limit);
    return successResponse(res, events);
  } catch (err) { return errorResponse(res, err.message); }
};

const createEvent = async (req, res) => {
  try {
    const { title, date, time, type, description } = req.body;
    if (!title || !date) return errorResponse(res, 'Title and date required', 400);
    const event = await CalendarEvent.create({ user: req.user._id, title, date, time, type, description });
    return successResponse(res, event, 'Event created', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

const updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!event) return errorResponse(res, 'Event not found', 404);
    return successResponse(res, event, 'Event updated');
  } catch (err) { return errorResponse(res, err.message); }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) return errorResponse(res, 'Event not found', 404);
    return successResponse(res, null, 'Event deleted');
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { getEvents, getUpcoming, createEvent, updateEvent, deleteEvent };
