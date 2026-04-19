const { Op } = require('sequelize');
const { Post, User } = require('../models');

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

module.exports = { relativeTime, resolveTargets };
