const { Op } = require('sequelize');
const { Report, Post, ModerationLog, User, UserWarning } = require('../models');
const { resolveTargets } = require('./reportService');

/* ========================================
   GET DASHBOARD DATA
   Loads pending reports and the current
   moderator's recent action history,
   enriching both with target names
   ======================================== */
async function getDashboardData(moderatorId, typeFilter) {
  const where = { status: 'pending' };
  if (typeFilter === 'post' || typeFilter === 'user') where.targetType = typeFilter;

  const [reports, historyLogs] = await Promise.all([
    Report.findAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    }),
    ModerationLog.findAll({
      where: { moderatorId },
      order: [['createdAt', 'DESC']],
      limit: 100
    })
  ]);

  const reportsData = await resolveTargets(reports);

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

    const postsMap = Object.fromEntries(histPosts.map(p => [p.id, p.title]));
    const usersMap = Object.fromEntries(histUsers.map(u => [u.id, u.name]));
    const reportMap = {};
    for (const r of relatedReports) {
      const key = `${r.targetType}:${r.targetId}`;
      if (!reportMap[key]) reportMap[key] = r;
    }

    historyData = historyLogs.map(log => {
      const related = reportMap[`${log.targetType}:${log.targetId}`];
      return {
        action: log.action,
        timestamp: log.createdAt,
        typeLabel: log.targetType === 'post' ? 'Post' : 'User',
        title: log.targetType === 'post'
          ? (postsMap[log.targetId] || 'Post #' + log.targetId)
          : (usersMap[log.targetId] || 'User #' + log.targetId),
        reporter: related ? (related.reporter ? related.reporter.name : 'System') : 'Unknown',
        reason: related ? (related.reason || '') : '',
        note: log.notes || ''
      };
    });
  }

  return { reportsData, historyData };
}

async function getReportData(reportId) {
  const report = await Report.findByPk(reportId, {
    include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }]
  });
  if (!report) return null;
  const [resolved] = await resolveTargets([report]);
  return resolved;
}

async function warnUser(reportId, moderatorId, notes) {
  const report = await Report.findByPk(reportId);
  if (!report) return { error: 'Report not found.' };

  let targetUserId;
  if (report.targetType === 'user') {
    targetUserId = report.targetId;
  } else {
    const post = await Post.findByPk(report.targetId, { attributes: ['id', 'userId'] });
    targetUserId = post ? post.userId : null;
  }

  const targetUser = targetUserId
    ? await User.findByPk(targetUserId, { attributes: ['id', 'isBanned'] })
    : null;
  if (!targetUser || targetUser.isBanned) return { error: 'This user account is no longer active.' };

  const warningMessage = notes || 'You have received a warning from a moderator for violating community guidelines.';
  const ops = [
    ModerationLog.create({ moderatorId, action: 'warn', targetType: report.targetType, targetId: report.targetId, notes: notes || null }),
    report.update({ status: 'reviewed' }),
    UserWarning.create({ userId: targetUserId, moderatorId, message: warningMessage })
  ];
  if (report.targetType === 'post') {
    ops.push(Post.update({ status: 'published' }, { where: { id: report.targetId, status: 'pending' } }));
  }
  await Promise.all(ops);
  return { success: 'Warning issued and report marked as reviewed.' };
}

async function dismissReport(reportId, moderatorId, notes) {
  const report = await Report.findByPk(reportId);
  if (!report) return { error: 'Report not found.' };
  const ops = [
    ModerationLog.create({ moderatorId, action: 'dismiss', targetType: report.targetType, targetId: report.targetId, notes: notes || null }),
    report.update({ status: 'resolved' })
  ];
  if (report.targetType === 'post') {
    ops.push(Post.update({ status: 'published' }, { where: { id: report.targetId, status: 'pending' } }));
  }
  await Promise.all(ops);
  return { success: 'Report dismissed.' };
}

async function escalateReport(reportId, moderatorId, escalationReason, notes) {
  const report = await Report.findByPk(reportId);
  if (!report) return { error: 'Report not found.' };
  if (!escalationReason || !escalationReason.trim()) return { error: 'Please select a reason for escalation.' };

  const fullNote = notes ? `${escalationReason}: ${notes.trim()}` : escalationReason;
  const ops = [
    ModerationLog.create({ moderatorId, action: 'escalate', targetType: report.targetType, targetId: report.targetId, notes: fullNote }),
    report.update({ status: 'escalated' })
  ];
  if (report.targetType === 'post') {
    ops.push(Post.update({ isHidden: true }, { where: { id: report.targetId } }));
  } else if (report.targetType === 'user') {
    ops.push(Post.update({ isHidden: true }, { where: { userId: report.targetId } }));
  }
  await Promise.all(ops);
  return { success: 'This report has been sent to a system admin for review.' };
}

async function getModerationHistory(moderatorId) {
  return ModerationLog.findAll({
    where: { moderatorId },
    include: [{ model: User, as: 'moderator', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']]
  });
}

module.exports = { getDashboardData, getReportData, warnUser, dismissReport, escalateReport, getModerationHistory };
