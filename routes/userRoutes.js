const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

/* ========================================
   OWN PROFILE & SETTINGS ROUTES
   GET  /users/profile   - render logged-in user's own profile page
   GET  /users/settings  - render settings form
   POST /users/settings  - save profile changes (name, password, interests,
                           location, privacy flags, profile picture upload)
   ======================================== */
router.get('/profile',          requireAuth, userController.getOwnProfile);
router.get('/settings',         requireAuth, userController.getSettings);
router.post('/settings',        requireAuth, upload.single('profilePic'), userController.updateSettings);

/* ========================================
   OTHER USER PROFILE ROUTES
   GET /users/profile/:id - view another user's public profile by ID
   GET /users/:id         - alias route for user profile by ID
   ======================================== */
router.get('/profile/:id',      userController.getUserById);
router.get('/:id',              userController.getUserById);

/* ========================================
   REPORT USER ROUTE
   POST /users/:id/report - submit a moderation report for a user
   ======================================== */
router.post('/:id/report',      requireAuth, userController.reportUser);

/* ========================================
   WARNING DISMISS ROUTE
   POST /users/warnings/dismiss - mark all
   unread warnings as read for current user
   ======================================== */
router.post('/warnings/dismiss', requireAuth, userController.dismissWarnings);

module.exports = router;
