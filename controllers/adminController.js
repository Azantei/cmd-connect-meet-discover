const adminService = require('../services/adminService');
const adminPresenter = require('../presenters/adminPresenter');

exports.getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsersData();
    const adminUsers = data.users.map((u, i) => adminPresenter.formatUserRow(u, i));
    res.render('admin/users', { title: 'User Management', ...data, adminUsers });
  } catch (err) { next(err); }
};

exports.banUser = async (req, res, next) => {
  try {
    const result = await adminService.banUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const result = await adminService.unbanUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.promoteUser = async (req, res, next) => {
  try {
    const result = await adminService.promoteUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.demoteUser = async (req, res, next) => {
  try {
    const result = await adminService.demoteUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.getEscalated = async (req, res, next) => {
  try {
    const data = await adminService.getEscalatedData();
    const escalatedRows = data.reports.map(r => adminPresenter.formatEscalatedRow(r));
    res.render('admin/escalated', { title: 'Escalated Reports', ...data, escalatedRows });
  } catch (err) { next(err); }
};

exports.removeEscalated = async (req, res, next) => {
  try {
    const result = await adminService.removeEscalatedReport(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

exports.dismissEscalated = async (req, res, next) => {
  try {
    const result = await adminService.dismissEscalatedReport(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

exports.banEscalated = async (req, res, next) => {
  try {
    const result = await adminService.banEscalatedUser(req.params.id);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

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

exports.getSettings = async (req, res, next) => {
  try {
    const data = await adminService.getSettingsData();
    res.render('admin/settings', { title: 'Platform Settings', ...data });
  } catch (err) { next(err); }
};

exports.saveSettings = async (req, res, next) => {
  try {
    await adminService.savePlatformSettings(req.body);
    req.flash('success', 'Settings saved.');
    res.redirect('/admin/settings');
  } catch (err) { next(err); }
};

exports.addCategory = async (req, res, next) => {
  try {
    const result = await adminService.addCategory(req.body.name);
    if (result.error) req.flash('error', result.error);
    else req.flash('catSuccess', result.catSuccess);
    res.redirect('/admin/settings?tab=categories');
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await adminService.deleteCategory(req.params.id);
    req.flash('catSuccess', 'Successfully removed!');
    res.redirect('/admin/settings?tab=categories');
  } catch (err) { next(err); }
};
