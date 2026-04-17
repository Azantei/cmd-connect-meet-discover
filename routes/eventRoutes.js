const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/create', requireAuth, eventController.getCreateEvent);
router.post('/', requireAuth, eventController.createEvent);
router.get('/:id', eventController.getEvent);
router.delete('/:id', requireAuth, eventController.deleteEvent);

module.exports = router;
