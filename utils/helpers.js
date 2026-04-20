const { Op } = require('sequelize');
const { Post, User } = require('../models');

/* ========================================
   RELATIVE TIME
   Converts a date to a human-readable
   relative string (e.g. "5 min ago",
   "2 hrs ago", "3 days ago")
   ======================================== */
function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + (hrs > 1 ? ' hrs ago' : ' hr ago');
  const days = Math.floor(hrs / 24);
  return days + (days > 1 ? ' days ago' : ' day ago');
}

/* ========================================
   RESOLVE TARGETS
   Given an array of Report objects, fetches
   the actual Post or User each report points
   to in two parallel DB queries, then maps
   the enriched data back onto each report.
   Used by both the moderator and admin
   controllers to avoid N+1 queries.
   ======================================== */
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

/* ========================================
   NORMALIZE CATEGORY ARRAY
   Ensures category always comes back as an
   array regardless of whether the form
   submitted a single string or an array
   ======================================== */
function normalizeCategoryArray(category) {
  return Array.isArray(category) ? category : (category ? [category] : []);
}

/* ========================================
   PARSE COMBINED DATE
   Combines separate date and time strings
   from form inputs into a single Date object;
   defaults time to 00:00 if not provided
   ======================================== */
function parseCombinedDate(date, time) {
  return date ? new Date(`${date}T${time || '00:00'}`) : null;
}

module.exports = { relativeTime, resolveTargets, normalizeCategoryArray, parseCombinedDate };
