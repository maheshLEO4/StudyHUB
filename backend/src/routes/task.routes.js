const router = require('express').Router();
const { getTasks, createTask, updateTask, deleteTask, toggleTask } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.patch('/:id/toggle', toggleTask);

module.exports = router;
