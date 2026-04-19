const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, eventController.getAllEvents);

module.exports = router;
