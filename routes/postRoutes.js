const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth, canModifyPost } = require('../middleware/authMiddleware');
const { postUpload } = require('../middleware/upload');

/* ========================================
   FEED & POST VIEW ROUTES
   GET /posts      - render public feed with optional search/category filters
   GET /posts/:id  - view a single post and its RSVP count
   ======================================== */
router.get('/',        postController.getFeed);
router.get('/:id',     postController.getPost);

/* ========================================
   CREATE POST ROUTES
   GET  /posts/new    - render create post form
   GET  /posts/create - alias for /posts/new
   POST /posts        - save new post to DB (with optional image upload)
   ======================================== */
router.get('/new',     requireAuth, postController.getCreatePost);
router.get('/create',  requireAuth, postController.getCreatePost);
router.post('/',       requireAuth, postUpload.single('imageUrl'), postController.createPost);

/* ========================================
   EDIT & DELETE POST ROUTES
   GET    /posts/:id/edit - render edit form (owner or staff only)
   POST   /posts/:id/edit - update post fields in DB (with optional new image)
   DELETE /posts/:id      - permanently remove post from DB
   ======================================== */
router.get('/:id/edit',  requireAuth, canModifyPost, postController.getEditPost);
router.post('/:id/edit', requireAuth, canModifyPost, postUpload.single('imageUrl'), postController.updatePost);
router.delete('/:id',  requireAuth, canModifyPost, postController.deletePost);

/* ========================================
   RSVP ROUTES
   POST   /posts/:id/rsvp - add current user's RSVP to the post
   DELETE /posts/:id/rsvp - remove current user's RSVP from the post
   ======================================== */
router.post('/:id/rsvp',    requireAuth, postController.createRsvp);
router.delete('/:id/rsvp',  requireAuth, postController.deleteRsvp);

/* ========================================
   REPORT POST ROUTE
   POST /posts/:id/report - submit a moderation report for a post
   ======================================== */
router.post('/:id/report',  requireAuth, postController.reportPost);

module.exports = router;
