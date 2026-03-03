const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.route('/')
  .get(ctrl.getEvents)
  .post([
    body('title').trim().notEmpty(),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
    body('type').optional().isIn(['study','exam','assignment','reminder']),
  ], validate, ctrl.createEvent);

router.route('/:id')
  .patch(ctrl.updateEvent)
  .delete(ctrl.deleteEvent);

module.exports = router;
