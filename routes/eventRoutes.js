const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth } = require('../middleware/authMiddleware');

/* ========================================
   EVENT ROUTES
   GET /events - fetch and render all published,
   non-hidden posts as browseable event cards.
   Requires an active session.
   ======================================== */
router.get('/', requireAuth, eventController.getAllEvents);

module.exports = router;
