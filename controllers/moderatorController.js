const { Report, Post, User } = require('../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const pendingCount = await Report.count({ where: { status: 'pending' } });
    res.render('moderator/dashboard', { title: 'Moderator Dashboard', pendingCount });
  } catch (err) { next(err); }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.findAll({
      where: { status: 'pending' },
      include: [
        { model: Post },
        { model: User, as: 'reporter', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.render('moderator/reports', { title: 'Pending Reports', reports });
  } catch (err) { next(err); }
};

exports.reviewReport = async (req, res, next) => {
  try {
    const { moderatorNote } = req.body;
    await Report.update({ status: 'reviewed', moderatorNote }, { where: { id: req.params.id } });
    req.flash('success', 'Report marked as reviewed.');
    res.redirect('/moderator/reports');
  } catch (err) { next(err); }
};

exports.escalateReport = async (req, res, next) => {
  try {
    await Report.update({ status: 'escalated' }, { where: { id: req.params.id } });
    req.flash('success', 'Report escalated to admin.');
    res.redirect('/moderator/reports');
  } catch (err) { next(err); }
};

exports.hidePost = async (req, res, next) => {
  try {
    await Post.update({ isHidden: true }, { where: { id: req.params.id } });
    req.flash('success', 'Post hidden.');
    res.redirect('/moderator/reports');
  } catch (err) { next(err); }
};
