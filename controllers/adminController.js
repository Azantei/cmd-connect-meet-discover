const { User, Post, Report, Category, RSVP, PlatformSetting } = require('../models');

exports.getUsers = async (req, res, next) => {
  try {
    const [users, activePosts, reportCount] = await Promise.all([
      User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'isBanned', 'createdAt'],
        order: [['createdAt', 'DESC']]
      }),
      Post.count(),
      Report.count({ where: { status: 'pending' } })
    ]);
    res.render('admin/users', { title: 'User Management', users, activePosts, reportCount });
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
    const reports = await Report.findAll({
      where: { status: 'escalated' },
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.render('admin/escalated', { title: 'Escalated Reports', reports });
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

exports.getAnalytics = async (req, res, next) => {
  try {
    const [userCount, postCount, pendingReportCount, rsvpCount] = await Promise.all([
      User.count(),
      Post.count(),
      Report.count({ where: { status: 'pending' } }),
      RSVP.count()
    ]);
    res.render('admin/analytics', { title: 'Analytics', userCount, postCount, pendingReportCount, rsvpCount });
  } catch (err) { next(err); }
};

exports.getSettings = async (req, res, next) => {
  try {
    const [categories, settingRows] = await Promise.all([
      Category.findAll({ order: [['name', 'ASC']] }),
      PlatformSetting.findAll()
    ]);
    const platformSettings = Object.fromEntries(settingRows.map(s => [s.key, s.value]));
    res.render('admin/settings', { title: 'Platform Settings', categories, platformSettings });
  } catch (err) { next(err); }
};

exports.saveSettings = async (req, res, next) => {
  try {
    const allowed = ['platformName', 'distanceRadius', 'guestBrowsing', 'registrationOpen', 'maintenanceMode'];
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
