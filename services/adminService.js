const { Op } = require('sequelize');
const { User, Post, Report, Category, RSVP, PlatformSetting, ModerationLog } = require('../models');

async function getUsersData() {
  const [users, activePosts, reportCount, escalatedCount] = await Promise.all([
    User.findAll({ attributes: ['id', 'name', 'email', 'role', 'isBanned', 'createdAt'], order: [['createdAt', 'DESC']] }),
    Post.count(),
    Report.count(),
    Report.count({ where: { status: 'escalated' } })
  ]);
  return { users, totalUsers: users.length, activePosts, reportCount, escalatedCount };
}

async function banUser(id) {
  const user = await User.findByPk(id);
  if (!user) return { error: 'User not found.' };
  if (user.isBanned) return { error: 'This user is already banned.' };
  await user.update({ isBanned: true });
  return { success: 'User banned.' };
}

async function unbanUser(id) {
  const user = await User.findByPk(id);
  if (!user) return { error: 'User not found.' };
  if (!user.isBanned) return { error: 'This user is not banned.' };
  await user.update({ isBanned: false });
  return { success: 'User unbanned.' };
}

async function promoteUser(id) {
  const user = await User.findByPk(id);
  if (!user) return { error: 'User not found.' };
  if (user.role === 'admin') return { error: 'Administrators cannot be assigned the moderator role.' };
  if (user.role === 'moderator') return { error: 'This user is already a moderator.' };
  if (user.isBanned) return { error: 'Banned users cannot be promoted.' };
  await user.update({ role: 'moderator' });
  return { success: `${user.name} has been promoted to Moderator.` };
}

async function demoteUser(id) {
  const user = await User.findByPk(id);
  if (!user) return { error: 'User not found.' };
  if (user.role !== 'moderator') return { error: 'This user is not a moderator.' };
  await user.update({ role: 'community_member' });
  return { success: 'User demoted to community member.' };
}

/* ========================================
   GET ESCALATED DATA
   Loads all escalated reports enriched with
   the moderator who escalated them, their
   notes, and the target name (user or post)
   ======================================== */
async function getEscalatedData() {
  const rawReports = await Report.findAll({
    where: { status: 'escalated' },
    include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']]
  });

  let reports = rawReports.map(r => ({
    id: r.id,
    type: r.targetType,
    targetId: r.targetId,
    reporterName: r.reporter ? r.reporter.name : 'Unknown',
    escalatedBy: 'Moderator',
    originalReason: r.reason || '',
    moderatorNotes: '',
    targetName: null,
    status: r.status,
    createdAt: r.createdAt
  }));

  if (rawReports.length > 0) {
    const userTargetIds = [...new Set(rawReports.filter(r => r.targetType === 'user').map(r => r.targetId))];
    const postTargetIds = [...new Set(rawReports.filter(r => r.targetType === 'post').map(r => r.targetId))];

    const [logs, targetUsers, targetPosts] = await Promise.all([
      ModerationLog.findAll({
        where: { action: 'escalate', [Op.or]: rawReports.map(r => ({ targetType: r.targetType, targetId: r.targetId })) },
        include: [{ model: User, as: 'moderator', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      }),
      userTargetIds.length ? User.findAll({ where: { id: { [Op.in]: userTargetIds } }, attributes: ['id', 'name', 'isBanned'] }) : Promise.resolve([]),
      postTargetIds.length ? Post.findAll({
        where: { id: { [Op.in]: postTargetIds } },
        attributes: ['id', 'title', 'userId'],
        include: [{ model: User, as: 'author', attributes: ['id', 'isBanned'] }]
      }) : Promise.resolve([])
    ]);

    const logMap = {};
    for (const log of logs) {
      const key = `${log.targetType}:${log.targetId}`;
      if (!logMap[key]) logMap[key] = log;
    }
    const usersMap = Object.fromEntries(targetUsers.map(u => [u.id, u]));
    const postsMap = Object.fromEntries(targetPosts.map(p => [p.id, p]));

    reports = reports.map(r => {
      const log = logMap[`${r.type}:${r.targetId}`];
      const targetUser = r.type === 'user' ? usersMap[r.targetId] : null;
      const targetPost = r.type === 'post' ? postsMap[r.targetId] : null;
      return {
        ...r,
        escalatedBy: log && log.moderator ? log.moderator.name : 'Moderator',
        moderatorNotes: log ? (log.notes || '') : '',
        targetName: r.type === 'user'
          ? (targetUser ? targetUser.name : 'Unknown User')
          : (targetPost ? targetPost.title : null),
        targetIsBanned: r.type === 'user'
          ? (targetUser ? targetUser.isBanned : false)
          : (targetPost && targetPost.author ? targetPost.author.isBanned : false)
      };
    });
  }

  return { reports, escalatedCount: reports.length };
}

async function removeEscalatedReport(id) {
  const report = await Report.findByPk(id);
  if (!report) return { error: 'Report not found.' };
  if (report.targetType !== 'post') return { error: 'Remove Post is only available for post reports.' };
  const post = await Post.findByPk(report.targetId);
  if (!post) return { error: 'This post no longer exists.' };
  await post.destroy();
  await report.update({ status: 'resolved', notes: 'Content removed by admin.' });
  return { success: 'Post removed successfully!' };
}

async function dismissEscalatedReport(id) {
  const report = await Report.findByPk(id);
  if (!report) return { error: 'Report not found.' };
  const ops = [report.update({ status: 'resolved', notes: 'Dismissed by admin.' })];
  if (report.targetType === 'post') {
    ops.push(Post.update({ isHidden: false }, { where: { id: report.targetId } }));
  } else if (report.targetType === 'user') {
    ops.push(Post.update({ isHidden: false }, { where: { userId: report.targetId } }));
  }
  await Promise.all(ops);
  return { success: 'Report dismissed.' };
}

async function banEscalatedUser(id) {
  const report = await Report.findByPk(id);
  if (!report) return { error: 'Report not found.' };
  let userId = null;
  if (report.targetType === 'user') {
    userId = report.targetId;
  } else if (report.targetType === 'post') {
    const post = await Post.findByPk(report.targetId, { attributes: ['userId'] });
    if (post) userId = post.userId;
  }
  if (!userId) return { error: 'This user account is no longer active.' };
  const targetUser = await User.findByPk(userId, { attributes: ['id', 'isBanned'] });
  if (!targetUser) return { error: 'This user account is no longer active.' };
  if (targetUser.isBanned) return { error: 'This user is already banned.' };
  await targetUser.update({ isBanned: true });
  await report.update({ status: 'resolved', notes: 'User banned by admin.' });
  return { success: 'User banned and report resolved.' };
}

async function getAnalyticsData({ startDate, endDate }) {
  const dateWhere = {};
  if (startDate || endDate) {
    dateWhere.createdAt = {};
    if (startDate) dateWhere.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateWhere.createdAt[Op.lte] = end;
    }
  }
  const [userCount, postCount, pendingReportCount, rsvpCount, escalatedCount] = await Promise.all([
    User.count({ where: dateWhere }),
    Post.count({ where: dateWhere }),
    Report.count({ where: dateWhere }),
    RSVP.count({ where: dateWhere }),
    Report.count({ where: { status: 'escalated' } })
  ]);
  return { userCount, postCount, pendingReportCount, rsvpCount, escalatedCount };
}

async function getSettingsData() {
  const [categories, settingRows, escalatedCount] = await Promise.all([
    Category.findAll({ order: [['name', 'ASC']] }),
    PlatformSetting.findAll(),
    Report.count({ where: { status: 'escalated' } })
  ]);
  return { categories, platformSettings: Object.fromEntries(settingRows.map(s => [s.key, s.value])), escalatedCount };
}

async function savePlatformSettings(body) {
  const allowed = ['platformName', 'distanceRadius'];
  await Promise.all(allowed.map(key => PlatformSetting.upsert({ key, value: body[key] ?? '' })));
}

async function addCategory(name) {
  if (!name || !name.trim()) return { error: 'Category name is required.' };
  try {
    await Category.create({ name: name.trim() });
    return { catSuccess: 'Successfully added!' };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return { error: 'That category already exists.' };
    throw err;
  }
}

async function deleteCategory(id) {
  await Category.destroy({ where: { id } });
}

module.exports = {
  getUsersData, banUser, unbanUser, promoteUser, demoteUser,
  getEscalatedData, removeEscalatedReport, dismissEscalatedReport, banEscalatedUser,
  getAnalyticsData, getSettingsData, savePlatformSettings, addCategory, deleteCategory
};
