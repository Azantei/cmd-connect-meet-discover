const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', postController.getAllPosts);
router.get('/create', requireAuth, postController.getCreatePost);
router.post('/', requireAuth, postController.createPost);
router.get('/:id', postController.getPost);
router.delete('/:id', requireAuth, postController.deletePost);
router.post('/:id/report', requireAuth, postController.reportPost);

module.exports = router;
