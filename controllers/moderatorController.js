const { Op } = require('sequelize');
const { Report, Post, ModerationLog, User } = require('../models');
const { resolveTargets } = require('../utils/helpers');

/* ========================================
   MODERATION DASHBOARD
   GET /moderator/dashboard
   Loads pending reports (with optional
   ?type=post|user filter) and the current
   moderator's recent action history
   ======================================== */
exports.getDashboard = async (req, res, next) => {
  try {
    const where = { status: 'pending' };
    if (req.query.type === 'post' || req.query.type === 'user') {
      where.targetType = req.query.type;
    }

    const [reports, historyLogs] = await Promise.all([
      Report.findAll({
        where,
        include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      }),
      ModerationLog.findAll({
        where: { moderatorId: req.session.userId },
        order: [['createdAt', 'DESC']],
        limit: 100
      })
    ]);

    const reportsData = await resolveTargets(reports);

    // Resolve target names and related report data for history
    let historyData = [];
    if (historyLogs.length > 0) {
      const postIds = [...new Set(historyLogs.filter(l => l.targetType === 'post').map(l => l.targetId))];
      const userIds = [...new Set(historyLogs.filter(l => l.targetType === 'user').map(l => l.targetId))];
      const logConditions = historyLogs.map(l => ({ targetType: l.targetType, targetId: l.targetId }));

      const [histPosts, histUsers, relatedReports] = await Promise.all([
        postIds.length ? Post.findAll({ where: { id: { [Op.in]: postIds } }, attributes: ['id', 'title'] }) : Promise.resolve([]),
        userIds.length ? User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'name'] }) : Promise.resolve([]),
        Report.findAll({
          where: { [Op.or]: logConditions },
          include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }],
          attributes: ['targetType', 'targetId', 'reason']
        })
      ]);

      const postsMap   = Object.fromEntries(histPosts.map(p => [p.id, p.title]));
      const usersMap   = Object.fromEntries(histUsers.map(u => [u.id, u.name]));
      const reportMap  = {};
      for (const r of relatedReports) {
        const key = `${r.targetType}:${r.targetId}`;
        if (!reportMap[key]) reportMap[key] = r;
      }

      historyData = historyLogs.map(log => {
        const related = reportMap[`${log.targetType}:${log.targetId}`];
        return {
          action:    log.action,
          timestamp: log.createdAt,
          typeLabel: log.targetType === 'post' ? 'Post' : 'User',
          title: log.targetType === 'post'
            ? (postsMap[log.targetId] || 'Post #' + log.targetId)
            : (usersMap[log.targetId] || 'User #' + log.targetId),
          reporter: related ? (related.reporter ? related.reporter.name : 'System') : 'Unknown',
          reason:   related ? (related.reason || '') : '',
          note:     log.notes || ''
        };
      });
    }

    res.render('moderator/dashboard', {
      title: 'Moderator Dashboard',
      reportsData,
      historyData,
      typeFilter: req.query.type || 'all'
    });
  } catch (err) { next(err); }
};

/* ========================================
   REPORT DETAIL
   GET /moderator/reports/:id
   Loads a single report and resolves its
   target (post or user) for display
   ======================================== */
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }]
    });
    if (!report) {
      req.flash('error', 'Report not found.');
      return res.redirect('/moderator/dashboard');
    }

    const [resolved] = await resolveTargets([report]);

    res.render('moderator/reports', {
      title: 'Report Detail',
      report: resolved
    });
  } catch (err) { next(err); }
};

/* ========================================
   WARN — REPORT ACTION
   POST /moderator/reports/:id/warn
   Creates a ModerationLog entry with
   action='warn' and marks the report reviewed
   ======================================== */
exports.warnReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      req.flash('error', 'Report not found.');
      return res.redirect('/moderator/dashboard');
    }

    const warnOps = [
      ModerationLog.create({
        moderatorId: req.session.userId,
        action:      'warn',
        targetType:  report.targetType,
        targetId:    report.targetId,
        notes:       req.body.notes || null
      }),
      report.update({ status: 'reviewed' })
    ];
    if (report.targetType === 'post') {
      warnOps.push(Post.update({ status: 'published' }, { where: { id: report.targetId, status: 'pending' } }));
    }
    await Promise.all(warnOps);

    req.flash('success', 'Warning issued and report marked as reviewed.');
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

/* ========================================
   DISMISS — REPORT ACTION
   POST /moderator/reports/:id/dismiss
   Creates a ModerationLog entry with
   action='dismiss' and marks the report resolved
   ======================================== */
exports.dismissReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      req.flash('error', 'Report not found.');
      return res.redirect('/moderator/dashboard');
    }

    const dismissOps = [
      ModerationLog.create({
        moderatorId: req.session.userId,
        action:      'dismiss',
        targetType:  report.targetType,
        targetId:    report.targetId,
        notes:       req.body.notes || null
      }),
      report.update({ status: 'resolved' })
    ];
    if (report.targetType === 'post') {
      dismissOps.push(Post.update({ status: 'published' }, { where: { id: report.targetId, status: 'pending' } }));
    }
    await Promise.all(dismissOps);

    req.flash('success', 'Report dismissed.');
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

/* ========================================
   ESCALATE — REPORT ACTION
   POST /moderator/reports/:id/escalate
   Creates a ModerationLog entry with
   action='escalate', marks the report escalated,
   and hides the post (isHidden=true) if the
   target is a post
   ======================================== */
exports.escalateReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      req.flash('error', 'Report not found.');
      return res.redirect('/moderator/dashboard');
    }

    if (!req.body.escalationReason || !req.body.escalationReason.trim()) {
      req.flash('error', 'Please select a reason for escalation.');
      return res.redirect('/moderator/dashboard');
    }

    const fullNote = req.body.notes
      ? `${req.body.escalationReason}: ${req.body.notes.trim()}`
      : req.body.escalationReason;

    const ops = [
      ModerationLog.create({
        moderatorId: req.session.userId,
        action:      'escalate',
        targetType:  report.targetType,
        targetId:    report.targetId,
        notes:       fullNote
      }),
      report.update({ status: 'escalated' })
    ];

    if (report.targetType === 'post') {
      ops.push(Post.update({ isHidden: true }, { where: { id: report.targetId } }));
    }

    await Promise.all(ops);

    req.flash('success', 'Report escalated to admin.' + (report.targetType === 'post' ? ' Post has been hidden.' : ''));
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

/* ========================================
   MODERATION HISTORY
   GET /moderator/history
   Loads all ModerationLog entries for the
   current moderator, ordered newest first
   ======================================== */
exports.getHistory = async (req, res, next) => {
  try {
    const logs = await ModerationLog.findAll({
      where: { moderatorId: req.session.userId },
      include: [{ model: User, as: 'moderator', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.render('moderator/history', {
      title: 'Moderation History',
      logs
    });
  } catch (err) { next(err); }
};
