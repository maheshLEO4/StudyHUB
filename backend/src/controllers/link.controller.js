// ============================================================
// Link Controller
// ============================================================
const Link = require('../models/Link.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

const getLinks = async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    const links = await Link.find(query).sort({ createdAt: -1 });
    return successResponse(res, links);
  } catch (err) { return errorResponse(res, err.message); }
};

const createLink = async (req, res) => {
  try {
    const { title, url, description, category, tags } = req.body;
    if (!title || !url) return errorResponse(res, 'Title and URL are required', 400);
    const link = await Link.create({ user: req.user._id, title, url, description, category, tags });
    return successResponse(res, link, 'Link saved', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

const updateLink = async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!link) return errorResponse(res, 'Link not found', 404);
    return successResponse(res, link, 'Link updated');
  } catch (err) { return errorResponse(res, err.message); }
};

const deleteLink = async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!link) return errorResponse(res, 'Link not found', 404);
    return successResponse(res, null, 'Link deleted');
  } catch (err) { return errorResponse(res, err.message); }
};

module.exports = { getLinks, createLink, updateLink, deleteLink };
