const router = require('express').Router();
const { getSubjects, getSubject, createSubject, updateSubject, deleteSubject } = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.route('/').get(getSubjects).post(createSubject);
router.route('/:id').get(getSubject).put(updateSubject).delete(deleteSubject);

module.exports = router;
