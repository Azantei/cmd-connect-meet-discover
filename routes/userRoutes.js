const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/profile',          requireAuth, userController.getOwnProfile);
router.get('/settings',         requireAuth, userController.getSettings);
router.post('/settings',        requireAuth, upload.single('profilePic'), userController.updateSettings);
router.get('/profile/:id',      userController.getUserById);
router.get('/:id',              userController.getUserById);
router.post('/:id/report',      requireAuth, userController.reportUser);

module.exports = router;
