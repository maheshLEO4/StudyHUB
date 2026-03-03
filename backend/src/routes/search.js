const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.globalSearch);
router.get('/dashboard', ctrl.dashboardStats);

module.exports = router;
