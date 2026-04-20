const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

/* ========================================
   ADMIN ROUTE GUARD
   All routes below require an active session
   with the 'admin' role
   ======================================== */
router.use(requireAuth, requireRole('admin'));

/* ========================================
   USER MANAGEMENT ROUTES
   GET  /admin/users           - list all users with stats
   POST /admin/users/:id/ban   - ban a user
   POST /admin/users/:id/unban - remove a ban
   POST /admin/users/:id/promote - elevate to moderator
   POST /admin/users/:id/demote  - revert to community_member
   ======================================== */
router.get('/users', adminController.getUsers);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.post('/users/:id/promote', adminController.promoteUser);
router.post('/users/:id/demote', adminController.demoteUser);

/* ========================================
   ESCALATED REPORTS ROUTES
   GET    /admin/escalated          - list reports escalated by moderators
   POST   /admin/escalated/:id/remove  - delete the reported post and resolve
   POST   /admin/escalated/:id/dismiss - dismiss without action
   POST   /admin/escalated/:id/ban     - ban the user behind the report
   ======================================== */
router.get('/escalated', adminController.getEscalated);
router.post('/escalated/:id/remove', adminController.removeEscalated);
router.post('/escalated/:id/dismiss', adminController.dismissEscalated);
router.post('/escalated/:id/ban', adminController.banEscalated);

/* ========================================
   ANALYTICS ROUTE
   GET /admin/analytics - platform-wide stats
   Supports ?startDate and ?endDate query params
   ======================================== */
router.get('/analytics', adminController.getAnalytics);

/* ========================================
   PLATFORM SETTINGS ROUTES
   GET    /admin/settings                    - load settings + categories
   POST   /admin/settings                    - save platformName / distanceRadius
   POST   /admin/settings/categories         - add a new category
   DELETE /admin/settings/categories/:id     - remove a category
   ======================================== */
router.get('/settings',                      adminController.getSettings);
router.post('/settings',                     adminController.saveSettings);
router.post('/settings/categories',          adminController.addCategory);
router.delete('/settings/categories/:id',    adminController.deleteCategory);

module.exports = router;
