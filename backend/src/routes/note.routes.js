const router = require('express').Router();
const { getNotes, getNote, createNote, updateNote, deleteNote, uploadFile } = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);
router.route('/').get(getNotes).post(createNote);
router.post('/upload', upload.single('file'), uploadFile);
router.route('/:id').get(getNote).put(updateNote).delete(deleteNote);

module.exports = router;
