const moderatorService = require('../services/moderatorService');

/* ========================================
   DASHBOARD & REPORT VIEWS
   ======================================== */
exports.getDashboard = async (req, res, next) => {
  try {
    const data = await moderatorService.getDashboardData(req.session.userId, req.query.type);
    res.render('moderator/dashboard', {
      title: 'Moderator Dashboard',
      reportsData: data.reportsData,
      pendingReportCount: data.pendingReportCount,
      historyData: data.historyData,
      typeFilter: req.query.type || 'all'
    });
  } catch (err) { next(err); }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await moderatorService.getReportData(req.params.id);
    if (!report) {
      req.flash('error', 'Report not found.');
      return res.redirect('/moderator/dashboard');
    }
    res.render('moderator/reports', { title: 'Report Detail', report });
  } catch (err) { next(err); }
};

/* ========================================
   REPORT ACTIONS
   ======================================== */
exports.warnReport = async (req, res, next) => {
  try {
    const result = await moderatorService.warnUser(req.params.id, req.session.userId, req.body.notes);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

exports.dismissReport = async (req, res, next) => {
  try {
    const result = await moderatorService.dismissReport(req.params.id, req.session.userId, req.body.notes);
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

exports.escalateReport = async (req, res, next) => {
  try {
    const result = await moderatorService.escalateReport(
      req.params.id, req.session.userId,
      req.body.escalationReason, req.body.notes
    );
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const logs = await moderatorService.getModerationHistory(req.session.userId);
    res.render('moderator/history', { title: 'Moderation History', logs });
  } catch (err) { next(err); }
};
