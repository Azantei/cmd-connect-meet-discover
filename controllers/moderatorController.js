const { Report, Post, ModerationLog, User } = require('../models');
const { resolveTargets } = require('../utils/helpers');

// GET /moderator/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const where = { status: 'pending' };
    if (req.query.type === 'post' || req.query.type === 'user') {
      where.targetType = req.query.type;
    }

    const reports = await Report.findAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    const reportsData = await resolveTargets(reports);

    res.render('moderator/dashboard', {
      title: 'Moderator Dashboard',
      reportsData,
      typeFilter: req.query.type || 'all'
    });
  } catch (err) { next(err); }
};

// GET /moderator/reports/:id
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

// POST /moderator/reports/:id/warn
exports.warnReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      req.flash('error', 'Report not found.');
      return res.redirect('/moderator/dashboard');
    }

    await Promise.all([
      ModerationLog.create({
        moderatorId: req.session.userId,
        action:      'warn',
        targetType:  report.targetType,
        targetId:    report.targetId,
        notes:       req.body.notes || null
      }),
      report.update({ status: 'reviewed' })
    ]);

    req.flash('success', 'Warning issued and report marked as reviewed.');
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

// POST /moderator/reports/:id/dismiss
exports.dismissReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      req.flash('error', 'Report not found.');
      return res.redirect('/moderator/dashboard');
    }

    await Promise.all([
      ModerationLog.create({
        moderatorId: req.session.userId,
        action:      'dismiss',
        targetType:  report.targetType,
        targetId:    report.targetId,
        notes:       req.body.notes || null
      }),
      report.update({ status: 'resolved' })
    ]);

    req.flash('success', 'Report dismissed.');
    res.redirect('/moderator/dashboard');
  } catch (err) { next(err); }
};

// POST /moderator/reports/:id/escalate
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

// GET /moderator/history
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
