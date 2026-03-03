const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habit.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.put('/:id/toggle', habitController.toggleHabit);
router.delete('/:id', habitController.deleteHabit);

module.exports = router;
