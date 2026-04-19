const express = require('express');
const router = express.Router();
const moderatorController = require('../controllers/moderatorController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth, requireRole('moderator', 'admin'));

router.get('/dashboard',              moderatorController.getDashboard);
router.get('/reports/:id',            moderatorController.getReport);
router.post('/reports/:id/warn',      moderatorController.warnReport);
router.post('/reports/:id/dismiss',   moderatorController.dismissReport);
router.post('/reports/:id/escalate',  moderatorController.escalateReport);
router.get('/history',                moderatorController.getHistory);

module.exports = router;
