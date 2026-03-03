const router = require('express').Router();
const { getProblems, getStats, createProblem, updateProblem, deleteProblem } = require('../controllers/dsa.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', getStats);
router.route('/').get(getProblems).post(createProblem);
router.route('/:id').put(updateProblem).delete(deleteProblem);

module.exports = router;
