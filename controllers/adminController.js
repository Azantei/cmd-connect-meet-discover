const adminService = require('../services/adminService');
const adminPresenter = require('../presenters/adminPresenter');

/* ========================================
   USER MANAGEMENT VIEWS
   ======================================== */
// Renders the User Management page with all users and platform stats.
exports.getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsersData();
    // Build presentation-friendly rows for the management table.
    const adminUsers = data.users.map((u, i) => adminPresenter.formatUserRow(u, i));
    res.render('admin/users', { title: 'User Management', ...data, adminUsers });
  } catch (err) { next(err); }
};

/* ========================================
   USER MANAGEMENT ACTIONS
   ======================================== */
// Bans a user account and flashes the result.
exports.banUser = async (req, res, next) => {
  try {
    const result = await adminService.banUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

// Removes a ban from a user account and flashes the result.
exports.unbanUser = async (req, res, next) => {
  try {
    const result = await adminService.unbanUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

// Promotes a user to the moderator role and flashes the result.
exports.promoteUser = async (req, res, next) => {
  try {
    const result = await adminService.promoteUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

// Demotes a moderator back to community member and flashes the result.
exports.demoteUser = async (req, res, next) => {
  try {
    const result = await adminService.demoteUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

/* ========================================
   ESCALATED REPORTS
   ======================================== */
// Renders the escalated reports queue.
exports.getEscalated = async (req, res, next) => {
  try {
    const data = await adminService.getEscalatedData();
    // Flatten report objects into table rows expected by the view.
    const escalatedRows = data.reports.map(r => adminPresenter.formatEscalatedRow(r));
    res.render('admin/escalated', { title: 'Escalated Reports', ...data, escalatedRows });
  } catch (err) { next(err); }
};

// Deletes the reported post and resolves the escalated report.
exports.removeEscalated = async (req, res, next) => {
  try {
    const result = await adminService.removeEscalatedReport(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

// Dismisses an escalated report without further action and unhides content.
exports.dismissEscalated = async (req, res, next) => {
  try {
    const result = await adminService.dismissEscalatedReport(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

// Bans the user behind an escalated report and marks the report resolved.
exports.banEscalated = async (req, res, next) => {
  try {
    const result = await adminService.banEscalatedUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

/* ========================================
   ANALYTICS
   ======================================== */
// Renders the analytics dashboard; supports optional startDate/endDate query params.
exports.getAnalytics = async (req, res, next) => {
  try {
    const data = await adminService.getAnalyticsData(req.query);
    res.render('admin/analytics', {
      title: 'Analytics',
      ...data,
      startDate: req.query.startDate || '',
      endDate: req.query.endDate || ''
    });
  } catch (err) { next(err); }
};

/* ========================================
   PLATFORM SETTINGS
   ======================================== */
// Renders the platform settings page with categories and current setting values.
exports.getSettings = async (req, res, next) => {
  try {
    const data = await adminService.getSettingsData();
    res.render('admin/settings', { title: 'Platform Settings', ...data });
  } catch (err) { next(err); }
};

// Persists platform name and distance radius settings, then redirects back.
exports.saveSettings = async (req, res, next) => {
  try {
    await adminService.savePlatformSettings(req.body);
    req.flash('success', 'Settings saved.');
    res.redirect('/admin/settings');
  } catch (err) { next(err); }
};

// Creates a new category and redirects to the categories tab.
exports.addCategory = async (req, res, next) => {
  try {
    const result = await adminService.addCategory(req.body.name);
    if (result.error) req.flash('error', result.error);
    else req.flash('catSuccess', result.catSuccess);
    res.redirect('/admin/settings?tab=categories');
  } catch (err) { next(err); }
};

// Removes a category by ID and redirects to the categories tab.
exports.deleteCategory = async (req, res, next) => {
  try {
    await adminService.deleteCategory(req.params.id);
    req.flash('catSuccess', 'Successfully removed!');
    res.redirect('/admin/settings?tab=categories');
  } catch (err) { next(err); }
};
