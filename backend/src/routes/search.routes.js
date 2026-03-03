const router = require('express').Router();
const { globalSearch } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, globalSearch);

module.exports = router;
