const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/todoController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// Checklists
router.route('/checklists')
  .get(ctrl.getChecklists)
  .post([body('name').trim().notEmpty()], validate, ctrl.createChecklist);
router.route('/checklists/:id')
  .patch(ctrl.updateChecklist)
  .delete(ctrl.deleteChecklist);

// Todos
router.route('/')
  .get(ctrl.getTodos)
  .post([body('text').trim().notEmpty()], validate, ctrl.createTodo);
router.route('/:id')
  .patch(ctrl.updateTodo)
  .delete(ctrl.deleteTodo);

module.exports = router;
