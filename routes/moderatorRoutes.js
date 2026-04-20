const express = require('express');
const router = express.Router();
const moderatorController = require('../controllers/moderatorController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

/* ========================================
   MODERATOR ROUTE GUARD
   All routes below require an active session
   with the 'moderator' or 'admin' role
   ======================================== */
router.use(requireAuth, requireRole('moderator', 'admin'));

/* ========================================
   DASHBOARD & REPORT DETAIL ROUTES
   GET /moderator/dashboard      - list pending reports with optional type filter
   GET /moderator/reports/:id    - view details for a single report
   ======================================== */
router.get('/dashboard',              moderatorController.getDashboard);
router.get('/reports/:id',            moderatorController.getReport);

/* ========================================
   REPORT ACTION ROUTES
   POST /moderator/reports/:id/warn     - issue a warning, mark report reviewed
   POST /moderator/reports/:id/dismiss  - dismiss report, mark resolved
   POST /moderator/reports/:id/escalate - escalate to admin, hide post if applicable
   ======================================== */
router.post('/reports/:id/warn',      moderatorController.warnReport);
router.post('/reports/:id/dismiss',   moderatorController.dismissReport);
router.post('/reports/:id/escalate',  moderatorController.escalateReport);

/* ========================================
   HISTORY ROUTE
   GET /moderator/history - view this moderator's action log
   ======================================== */
router.get('/history',                moderatorController.getHistory);

module.exports = router;
