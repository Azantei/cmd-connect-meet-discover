const bcrypt = require('bcrypt');
const { User, Post } = require('../models');

exports.getOwnProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      include: [{ model: Post, order: [['createdAt', 'DESC']] }]
    });
    res.render('users/profile', { title: 'My Profile', profileUser: user, isOwn: true });
  } catch (err) { next(err); }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Post, where: { isHidden: false }, required: false, order: [['createdAt', 'DESC']] }]
    });
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/'); }
    const isOwn = req.session.userId === user.id;
    res.render('users/profile', { title: `${user.username}'s Profile`, profileUser: user, isOwn });
  } catch (err) { next(err); }
};

exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId);
    res.render('users/settings', { title: 'Settings', user });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { username, bio, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.session.userId);
    const updates = { username, bio };

    if (newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) { req.flash('error', 'Current password is incorrect.'); return res.redirect('/users/settings'); }
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    await user.update(updates);
    req.session.username = username;
    req.flash('success', 'Settings updated.');
    res.redirect('/users/settings');
  } catch (err) { next(err); }
};
