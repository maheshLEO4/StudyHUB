const router = require('express').Router();
const { globalSearch, dashboardStats } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', globalSearch);
router.get('/dashboard', dashboardStats);

module.exports = router;
