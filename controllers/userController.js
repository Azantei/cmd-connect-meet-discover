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
      attributes: ['id', 'name', 'location', 'interests', 'profilePic', 'showLocation', 'showInterests']
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
      attributes: ['id', 'name', 'email', 'location', 'interests', 'profilePic', 'showLocation', 'showInterests']
    });
    res.render('users/settings', { title: 'Settings', user });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { location, interests, newPassword, confirmPassword, showLocation, showInterests } = req.body;
    // name may arrive as an array when multiple same-named inputs exist in the form
    const rawName = Array.isArray(req.body.name) ? req.body.name[0] : req.body.name;

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
    if (rawName && rawName.trim()) user.name = rawName.trim();
    if (location !== undefined) user.location = location || null;

    // Only update interests when the field was intentionally submitted (non-empty)
    if (interests !== undefined && interests !== '') {
      const interestsArray = Array.isArray(interests)
        ? interests
        : interests.split(',').map(s => s.trim()).filter(Boolean);
      user.interests = interestsArray;
    }

    // Save privacy flags when submitted from the Privacy section
    if (showLocation !== undefined) user.showLocation = showLocation === '1';
    if (showInterests !== undefined) user.showInterests = showInterests === '1';

    if (req.file) user.profilePic = `/uploads/${req.file.filename}`;
    if (newPassword && newPassword.trim()) user.password = newPassword;
    await user.save();

    if (rawName && rawName.trim()) req.session.username = rawName.trim();
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
