const { User, Post, RSVP, Report } = require('../models');

exports.getOwnProfile = async (req, res, next) => {
  try {
    const [user, posts, rsvps] = await Promise.all([
      User.findByPk(req.session.userId, {
        attributes: ['id', 'name', 'email', 'location', 'interests', 'role', 'profilePic']
      }),
      Post.findAll({
        where: { userId: req.session.userId, isHidden: false },
        order: [['createdAt', 'DESC']]
      }),
      RSVP.findAll({
        where: { userId: req.session.userId },
        include: [{ model: Post, where: { isHidden: false }, required: true }],
        order: [['createdAt', 'DESC']]
      })
    ]);
    res.render('users/profile', { title: 'My Profile', profileUser: user, posts, rsvps });
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'location', 'interests', 'profilePic']
    });
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/feed'); }
    const posts = await Post.findAll({
      where: { userId: user.id, isHidden: false },
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
    const { name, location, interests } = req.body;
    const interestsArray = Array.isArray(interests)
      ? interests
      : (interests ? interests.split(',').map(s => s.trim()).filter(Boolean) : []);

    const updates = {
      name:      name && name.trim() ? name.trim() : undefined,
      location:  location || null,
      interests: interestsArray
    };

    if (req.file) {
      updates.profilePic = `/uploads/${req.file.filename}`;
    }

    await User.update(updates, { where: { id: req.session.userId } });

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
