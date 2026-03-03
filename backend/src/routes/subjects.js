const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(ctrl.getSubjects)
  .post([
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ], validate, ctrl.createSubject);

router.route('/:id')
  .get(ctrl.getSubject)
  .patch(ctrl.updateSubject)
  .delete(ctrl.deleteSubject);

router.post('/:id/notes', [body('title').trim().notEmpty()], validate, ctrl.addNote);
router.patch('/:id/notes/:noteId', ctrl.updateNote);
router.delete('/:id/notes/:noteId', ctrl.deleteNote);

module.exports = router;
