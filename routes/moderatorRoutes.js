const express = require('express');
const router = express.Router();
const moderatorController = require('../controllers/moderatorController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth, requireRole('moderator', 'admin'));

router.get('/dashboard', moderatorController.getDashboard);
router.get('/reports', moderatorController.getReports);
router.put('/reports/:id/review', moderatorController.reviewReport);
router.put('/reports/:id/escalate', moderatorController.escalateReport);
router.put('/posts/:id/hide', moderatorController.hidePost);

module.exports = router;
