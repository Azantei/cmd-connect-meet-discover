const { User, Post, Report, Category, RSVP, PlatformSetting, ModerationLog } = require('../models');
const { Op } = require('sequelize');

exports.getUsers = async (req, res, next) => {
  try {
    const [users, activePosts, reportCount, escalatedCount] = await Promise.all([
      User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'isBanned', 'createdAt'],
        order: [['createdAt', 'DESC']]
      }),
      Post.count(),
      Report.count({ where: { status: 'pending' } }),
      Report.count({ where: { status: 'escalated' } })
    ]);
    res.render('admin/users', { title: 'User Management', users, activePosts, reportCount, escalatedCount });
  } catch (err) { next(err); }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/admin/users'); }
    if (user.isBanned) { req.flash('error', 'This user is already banned.'); return res.redirect('/admin/users'); }
    await user.update({ isBanned: true });
    req.flash('success', 'User banned.');
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/admin/users'); }
    if (!user.isBanned) { req.flash('error', 'This user is not banned.'); return res.redirect('/admin/users'); }
    await user.update({ isBanned: false });
    req.flash('success', 'User unbanned.');
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.promoteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/admin/users'); }
    if (user.role === 'moderator') { req.flash('error', 'This user is already a moderator.'); return res.redirect('/admin/users'); }
    await user.update({ role: 'moderator' });
    req.flash('success', 'User promoted to moderator.');
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.demoteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/admin/users'); }
    if (user.role !== 'moderator') { req.flash('error', 'This user is not a moderator.'); return res.redirect('/admin/users'); }
    await user.update({ role: 'community_member' });
    req.flash('success', 'User demoted to community member.');
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.getEscalated = async (req, res, next) => {
  try {
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
      const userTargetIds  = [...new Set(rawReports.filter(r => r.targetType === 'user').map(r => r.targetId))];
      const postTargetIds  = [...new Set(rawReports.filter(r => r.targetType === 'post').map(r => r.targetId))];

      const [logs, targetUsers, targetPosts] = await Promise.all([
        ModerationLog.findAll({
          where: {
            action: 'escalate',
            [Op.or]: rawReports.map(r => ({ targetType: r.targetType, targetId: r.targetId }))
          },
          include: [{ model: User, as: 'moderator', attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']]
        }),
        userTargetIds.length
          ? User.findAll({ where: { id: { [Op.in]: userTargetIds } }, attributes: ['id', 'name'] })
          : Promise.resolve([]),
        postTargetIds.length
          ? Post.findAll({ where: { id: { [Op.in]: postTargetIds } }, attributes: ['id', 'title'] })
          : Promise.resolve([])
      ]);

      const logMap       = {};
      for (const log of logs) {
        const key = `${log.targetType}:${log.targetId}`;
        if (!logMap[key]) logMap[key] = log;
      }
      const usersMap = Object.fromEntries(targetUsers.map(u => [u.id, u.name]));
      const postsMap = Object.fromEntries(targetPosts.map(p => [p.id, p.title]));

      reports = reports.map(r => {
        const log = logMap[`${r.type}:${r.targetId}`];
        return {
          ...r,
          escalatedBy:   log && log.moderator ? log.moderator.name : 'Moderator',
          moderatorNotes: log ? (log.notes || '') : '',
          targetName: r.type === 'user'
            ? (usersMap[r.targetId] || 'Unknown User')
            : (postsMap[r.targetId] || null)
        };
      });
    }

    res.render('admin/escalated', { title: 'Escalated Reports', reports, escalatedCount: reports.length });
  } catch (err) { next(err); }
};

exports.removeEscalated = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) { req.flash('error', 'Report not found.'); return res.redirect('/admin/escalated'); }
    if (report.targetType === 'post') {
      await Post.destroy({ where: { id: report.targetId } });
    }
    await report.update({ status: 'resolved', notes: 'Content removed by admin.' });
    req.flash('success', 'Post removed and report resolved.');
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

exports.dismissEscalated = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) { req.flash('error', 'Report not found.'); return res.redirect('/admin/escalated'); }
    await report.update({ status: 'resolved', notes: 'Dismissed by admin.' });
    req.flash('success', 'Report dismissed.');
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

exports.banEscalated = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) { req.flash('error', 'Report not found.'); return res.redirect('/admin/escalated'); }

    let userId = null;
    if (report.targetType === 'user') {
      userId = report.targetId;
    } else if (report.targetType === 'post') {
      const post = await Post.findByPk(report.targetId, { attributes: ['userId'] });
      if (post) userId = post.userId;
    }

    if (userId) {
      await User.update({ isBanned: true }, { where: { id: userId } });
    }

    await report.update({ status: 'resolved', notes: 'User banned by admin.' });
    req.flash('success', 'User banned and report resolved.');
    res.redirect('/admin/escalated');
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
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
      Report.count({ where: { status: 'pending', ...dateWhere } }),
      RSVP.count({ where: dateWhere }),
      Report.count({ where: { status: 'escalated' } })
    ]);
    res.render('admin/analytics', {
      title: 'Analytics', userCount, postCount, pendingReportCount, rsvpCount, escalatedCount,
      startDate: startDate || '', endDate: endDate || ''
    });
  } catch (err) { next(err); }
};

exports.getSettings = async (req, res, next) => {
  try {
    const [categories, settingRows, escalatedCount] = await Promise.all([
      Category.findAll({ order: [['name', 'ASC']] }),
      PlatformSetting.findAll(),
      Report.count({ where: { status: 'escalated' } })
    ]);
    const platformSettings = Object.fromEntries(settingRows.map(s => [s.key, s.value]));
    res.render('admin/settings', { title: 'Platform Settings', categories, platformSettings, escalatedCount });
  } catch (err) { next(err); }
};

exports.saveSettings = async (req, res, next) => {
  try {
    const allowed = ['platformName', 'distanceRadius'];
    await Promise.all(
      allowed.map(key =>
        PlatformSetting.upsert({ key, value: req.body[key] ?? '' })
      )
    );
    req.flash('success', 'Settings saved.');
    res.redirect('/admin/settings');
  } catch (err) { next(err); }
};

exports.addCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) { req.flash('error', 'Category name is required.'); return res.redirect('/admin/settings'); }
    await Category.create({ name: name.trim() });
    req.flash('success', `Category "${name.trim()}" added.`);
    res.redirect('/admin/settings');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'That category already exists.');
      return res.redirect('/admin/settings');
    }
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    req.flash('success', 'Category removed.');
    res.redirect('/admin/settings');
  } catch (err) { next(err); }
};
