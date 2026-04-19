const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth, requireRole('admin'));

router.get('/users', adminController.getUsers);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.post('/users/:id/promote', adminController.promoteUser);
router.post('/users/:id/demote', adminController.demoteUser);

router.get('/escalated', adminController.getEscalated);
router.post('/escalated/:id/remove', adminController.removeEscalated);
router.post('/escalated/:id/dismiss', adminController.dismissEscalated);

router.get('/analytics', adminController.getAnalytics);

router.get('/settings',                      adminController.getSettings);
router.post('/settings',                     adminController.saveSettings);
router.post('/settings/categories',          adminController.addCategory);
router.delete('/settings/categories/:id',    adminController.deleteCategory);

module.exports = router;
