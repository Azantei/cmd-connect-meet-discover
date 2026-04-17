const { User, Post, Event, Report } = require('../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const [userCount, postCount, eventCount, reportCount] = await Promise.all([
      User.count(), Post.count(), Event.count(), Report.count({ where: { status: 'pending' } })
    ]);
    res.render('admin/dashboard', { title: 'Admin Dashboard', userCount, postCount, eventCount, reportCount });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.render('admin/users', { title: 'User Management', users });
  } catch (err) { next(err); }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.redirect('/admin/users');
    await user.update({ isBanned: !user.isBanned });
    req.flash('success', `User ${user.isBanned ? 'banned' : 'unbanned'}.`);
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    await User.update({ role }, { where: { id: req.params.id } });
    req.flash('success', 'Role updated.');
    res.redirect('/admin/users');
  } catch (err) { next(err); }
};

exports.getEscalatedReports = async (req, res, next) => {
  try {
    const reports = await Report.findAll({
      where: { status: 'escalated' },
      include: [
        { model: Post },
        { model: User, as: 'reporter', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.render('admin/reports', { title: 'Escalated Reports', reports });
  } catch (err) { next(err); }
};

exports.resolveReport = async (req, res, next) => {
  try {
    await Report.update({ status: 'resolved' }, { where: { id: req.params.id } });
    req.flash('success', 'Report resolved.');
    res.redirect('/admin/reports');
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const [userCount, postCount, eventCount] = await Promise.all([
      User.count(), Post.count(), Event.count()
    ]);
    res.render('admin/analytics', { title: 'Analytics', userCount, postCount, eventCount });
  } catch (err) { next(err); }
};

exports.getSettings = (req, res) => {
  res.render('admin/settings', { title: 'Admin Settings' });
};

exports.updateSettings = (req, res) => {
  req.flash('success', 'Settings saved.');
  res.redirect('/admin/settings');
};
