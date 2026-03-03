const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/dsaController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.route('/')
  .get(ctrl.getProblems)
  .post([
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('difficulty').optional().isIn(['Easy','Medium','Hard']),
    body('status').optional().isIn(['not-started','in-progress','completed']),
  ], validate, ctrl.createProblem);

router.route('/:id')
  .patch(ctrl.updateProblem)
  .delete(ctrl.deleteProblem);

module.exports = router;
