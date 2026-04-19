const { Op } = require('sequelize');
const { Report, Post, User, ModerationLog } = require('../models');

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + (hrs > 1 ? ' hrs ago' : ' hr ago');
  const days = Math.floor(hrs / 24);
  return days + (days > 1 ? ' days ago' : ' day ago');
}

async function resolveTargets(reports) {
  const postIds = reports.filter(r => r.targetType === 'post').map(r => r.targetId);
  const userIds = reports.filter(r => r.targetType === 'user').map(r => r.targetId);

  const [targetPosts, targetUsers] = await Promise.all([
    postIds.length
      ? Post.findAll({
          where: { id: { [Op.in]: postIds } },
          include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
        })
      : [],
    userIds.length
      ? User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'name'] })
      : []
  ]);

  const postsMap = Object.fromEntries(targetPosts.map(p => [p.id, p]));
  const usersMap = Object.fromEntries(targetUsers.map(u => [u.id, u]));

  return reports.map(r => {
    const tp = r.targetType === 'post' ? postsMap[r.targetId] : null;
    const tu = r.targetType === 'user' ? usersMap[r.targetId] : null;
    return {
      id: r.id,
      type: r.targetType,
      targetId: r.targetId,
      title: r.targetType === 'post'
        ? (tp ? tp.title : 'Deleted Post')
        : (tu ? tu.name : 'Deleted User'),
      reporter: r.reporter ? r.reporter.name : 'Unknown',
      author: r.targetType === 'post'
        ? (tp && tp.author ? tp.author.name : 'Unknown')
        : (tu ? tu.name : 'Unknown'),
      time: relativeTime(r.createdAt),
      reason: r.reason,
      note: r.notes || '',
      submittedAt: new Date(r.createdAt).getTime(),
      userActive: tu !== null || r.targetType === 'post'
    };
  });
}

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

    const ops = [
      ModerationLog.create({
        moderatorId: req.session.userId,
        action:      'escalate',
        targetType:  report.targetType,
        targetId:    report.targetId,
        notes:       req.body.notes || null
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
