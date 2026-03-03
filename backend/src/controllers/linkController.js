/**
 * Link Controller — saved bookmarks with categories and tags
 */
const Link = require('../models/Link');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

exports.getLinks = catchAsync(async (req, res) => {
  const { category, tag, search, page = 1, limit = 50 } = req.query;
  const query = { user: req.user._id };
  if (category && category !== 'All') query.category = category;
  if (tag) query.tags = tag;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { tags: { $regex: search, $options: 'i' } },
  ];
  const skip = (page - 1) * limit;
  const [links, total] = await Promise.all([
    Link.find(query).sort({ isFavorite: -1, createdAt: -1 }).skip(skip).limit(+limit),
    Link.countDocuments(query),
  ]);
  sendSuccess(res, 200, 'Links fetched', links, { total, page: +page, limit: +limit });
});

exports.createLink = catchAsync(async (req, res) => {
  const link = await Link.create({ ...req.body, user: req.user._id });
  sendSuccess(res, 201, 'Link saved', link);
});

exports.updateLink = catchAsync(async (req, res) => {
  const link = await Link.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!link) throw new AppError('Link not found', 404);
  sendSuccess(res, 200, 'Link updated', link);
});

exports.deleteLink = catchAsync(async (req, res) => {
  const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!link) throw new AppError('Link not found', 404);
  sendSuccess(res, 200, 'Link deleted');
});
