const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/authMiddleware');
const { postUpload } = require('../middleware/upload');

router.get('/',        postController.getFeed);
router.get('/new',     requireAuth, postController.getCreatePost);
router.get('/create',  requireAuth, postController.getCreatePost);
router.post('/',       requireAuth, postUpload.single('imageUrl'), postController.createPost);
router.get('/:id',     postController.getPost);
router.delete('/:id',  requireAuth, postController.deletePost);
router.post('/:id/rsvp',    requireAuth, postController.createRsvp);
router.delete('/:id/rsvp',  requireAuth, postController.deleteRsvp);
router.post('/:id/report',  requireAuth, postController.reportPost);

module.exports = router;
