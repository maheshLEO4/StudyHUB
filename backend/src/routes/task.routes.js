const router = require('express').Router();
const { getTasks, createTask, updateTask, deleteTask, toggleTask, getChecklists } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/checklists', getChecklists);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.patch('/:id/toggle', toggleTask);

module.exports = router;
