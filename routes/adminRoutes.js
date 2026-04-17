const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/role', adminController.changeRole);
router.get('/reports', adminController.getEscalatedReports);
router.put('/reports/:id/resolve', adminController.resolveReport);
router.get('/analytics', adminController.getAnalytics);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
