const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/profile', requireAuth, userController.getOwnProfile);
router.get('/profile/:id', requireAuth, userController.getUserProfile);
router.get('/settings', requireAuth, userController.getSettings);
router.put('/settings', requireAuth, userController.updateSettings);

module.exports = router;
