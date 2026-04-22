const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth } = require('../middleware/authMiddleware');

/* ========================================
   EVENT ROUTES
   GET /feed  - render the events feed (canonical URL).
   GET /events - 301 redirect to /feed for backwards
   compatibility with bookmarks and old links.
   ======================================== */
router.get('/', (req, res, next) => {
  if (req.baseUrl === '/events') return res.redirect(301, '/feed');
  return requireAuth(req, res, next);
}, eventController.getAllEvents);

module.exports = router;
