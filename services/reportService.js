const { Op } = require('sequelize');
const { Post, User, Report } = require('../models');
const { relativeTime } = require('../utils/helpers');

/* ========================================
   RESOLVE TARGETS
   Given an array of Report objects, fetches
   the actual Post or User each report points
   to in two parallel DB queries, then maps
   the enriched data back onto each report.
   ======================================== */
async function resolveTargets(reports) {
  const postIds = reports.filter(r => r.targetType === 'post').map(r => r.targetId);
  const userIds = reports.filter(r => r.targetType === 'user').map(r => r.targetId);

  const [targetPosts, targetUsers] = await Promise.all([
    postIds.length
      ? Post.findAll({
          where: { id: { [Op.in]: postIds } },
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'isBanned'] }]
        })
      : [],
    userIds.length
      ? User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'name', 'isBanned'] })
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
      reporter: r.reporter ? r.reporter.name : 'System',
      author: r.targetType === 'post'
        ? (tp && tp.author ? tp.author.name : 'Unknown')
        : (tu ? tu.name : 'Unknown'),
      time: relativeTime(r.createdAt),
      reason: r.reason,
      note: r.notes || '',
      submittedAt: new Date(r.createdAt).getTime(),
      userActive: r.targetType === 'post'
        ? (tp && tp.author ? !tp.author.isBanned : true)
        : (tu !== null && !tu.isBanned)
    };
  });
}

// Creates a moderation report targeting a post.
async function createPostReport(reporterId, targetId, reason) {
  return Report.create({ reporterId, targetType: 'post', targetId, reason });
}

// Creates a moderation report targeting a user.
async function createUserReport(reporterId, targetId, reason) {
  return Report.create({ reporterId, targetType: 'user', targetId, reason });
}

module.exports = { resolveTargets, createPostReport, createUserReport };
