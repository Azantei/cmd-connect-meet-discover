const { User, Post, RSVP, Report } = require('../models');

exports.getOwnProfile = async (req, res, next) => {
  try {
    const [user, posts, rsvps, drafts] = await Promise.all([
      User.findByPk(req.session.userId, {
        attributes: ['id', 'name', 'email', 'location', 'interests', 'role', 'profilePic']
      }),
      Post.findAll({
        where: { userId: req.session.userId, isHidden: false, status: 'published' },
        order: [['createdAt', 'DESC']]
      }),
      RSVP.findAll({
        where: { userId: req.session.userId },
        include: [{ model: Post, where: { isHidden: false, status: 'published' }, required: true }],
        order: [['createdAt', 'DESC']]
      }),
      Post.findAll({
        where: { userId: req.session.userId, status: 'draft' },
        order: [['createdAt', 'DESC']]
      })
    ]);
    res.render('users/profile', { title: 'My Profile', profileUser: user, posts, rsvps, drafts });
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'location', 'interests', 'profilePic']
    });
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/posts'); }
    const posts = await Post.findAll({
      where: { userId: user.id, isHidden: false, status: 'published' },
      order: [['createdAt', 'DESC']]
    });
    res.render('users/otherProfile', {
      title: `${user.name}'s Profile`,
      profileUser: user,
      posts
    });
  } catch (err) { next(err); }
};

exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'location', 'interests', 'profilePic']
    });
    res.render('users/settings', { title: 'Settings', user });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { name, location, interests, newPassword, confirmPassword } = req.body;
    const interestsArray = Array.isArray(interests)
      ? interests
      : (interests ? interests.split(',').map(s => s.trim()).filter(Boolean) : []);

    if (newPassword && newPassword.trim()) {
      if (newPassword !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/users/settings');
      }
      if (newPassword.length < 8) {
        req.flash('error', 'Password must be at least 8 characters.');
        return res.redirect('/users/settings');
      }
    }

    const user = await User.findByPk(req.session.userId);
    if (name && name.trim()) user.name = name.trim();
    user.location  = location || null;
    user.interests = interestsArray;
    if (req.file) user.profilePic = `/uploads/${req.file.filename}`;
    if (newPassword && newPassword.trim()) user.password = newPassword;
    await user.save();

    if (name && name.trim()) req.session.username = name.trim();
    req.flash('success', 'Settings updated.');
    res.redirect('/users/profile');
  } catch (err) { next(err); }
};

exports.reportUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      req.flash('error', 'A reason is required.');
      return res.redirect(`/users/${req.params.id}`);
    }
    await Report.create({
      reporterId: req.session.userId,
      targetType: 'user',
      targetId:   req.params.id,
      reason:     reason.trim()
    });
    req.flash('success', 'Report submitted. Thank you.');
    res.redirect(`/users/${req.params.id}`);
  } catch (err) { next(err); }
};
