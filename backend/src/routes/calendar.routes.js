const router = require('express').Router();
const { getEvents, getUpcoming, createEvent, updateEvent, deleteEvent } = require('../controllers/calendar.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/upcoming', getUpcoming);
router.route('/').get(getEvents).post(createEvent);
router.route('/:id').put(updateEvent).delete(deleteEvent);

module.exports = router;
