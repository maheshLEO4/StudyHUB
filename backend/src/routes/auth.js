const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const nameRules = body('name').trim().notEmpty().isLength({ max: 50 });
const emailRules = body('email').isEmail().normalizeEmail();
const passwordRules = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars');

router.post('/signup',  [nameRules, emailRules, passwordRules], validate, ctrl.signup);
router.post('/login',   [emailRules, body('password').notEmpty()], validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout',  protect, ctrl.logout);
router.get('/me',       protect, ctrl.getMe);
router.patch('/me',     protect, [nameRules], validate, ctrl.updateMe);
router.patch('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], validate, ctrl.changePassword);

module.exports = router;
