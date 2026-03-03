const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/linkController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.route('/')
  .get(ctrl.getLinks)
  .post([
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('url').trim().notEmpty().isURL(),
  ], validate, ctrl.createLink);

router.route('/:id')
  .patch(ctrl.updateLink)
  .delete(ctrl.deleteLink);

module.exports = router;
