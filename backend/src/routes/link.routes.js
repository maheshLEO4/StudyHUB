const router = require('express').Router();
const { getLinks, createLink, updateLink, deleteLink } = require('../controllers/link.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.route('/').get(getLinks).post(createLink);
router.route('/:id').put(updateLink).delete(deleteLink);

module.exports = router;
