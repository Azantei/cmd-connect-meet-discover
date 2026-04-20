const { User, Post, RSVP, Report, sequelize } = require('../models');

/* ========================================
   OWN PROFILE
   GET /users/profile
   Fetches the logged-in user's info, their
   published posts, draft posts, and RSVPs.
   RSVPs are split into upcoming vs past,
   and RSVP counts for all relevant posts
   are loaded in a single grouped query
   ======================================== */
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

    // Split RSVPs into upcoming (future/no date) and past (date already passed)
    const now = new Date();
    const upcomingRsvps = rsvps.filter(r => !r.Post.date || new Date(r.Post.date) > now);
    const pastRsvps     = rsvps.filter(r => r.Post.date && new Date(r.Post.date) <= now);

    // Fetch RSVP counts for all relevant posts in one query
    const allPostIds = [
      ...posts.map(p => p.id),
      ...rsvps.map(r => r.Post.id)
    ].filter((id, i, arr) => arr.indexOf(id) === i);

    const rsvpCounts = {};
    if (allPostIds.length > 0) {
      const counts = await RSVP.findAll({
        where: { postId: allPostIds },
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['postId'],
        raw: true
      });
      counts.forEach(row => { rsvpCounts[row.postId] = parseInt(row.count, 10); });
    }

    res.render('users/profile', { title: 'My Profile', profileUser: user, posts, upcomingRsvps, pastRsvps, drafts, rsvpCounts });
  } catch (err) { next(err); }
};

/* ========================================
   OTHER USER'S PROFILE
   GET /users/profile/:id  and  GET /users/:id
   Fetches a user's public info and their
   published posts for the public profile view
   ======================================== */
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

/* ========================================
   SETTINGS FORM
   GET /users/settings
   Fetches the current user's editable fields
   to pre-populate the settings form
   ======================================== */
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'location', 'interests', 'profilePic', 'showLocation', 'showInterests']
    });
    res.render('users/settings', { title: 'Settings', user });
  } catch (err) { next(err); }
};

/* ========================================
   UPDATE SETTINGS
   POST /users/settings
   Updates the user row: name, location,
   interests array, privacy toggles,
   optional new password (re-hashed via hook),
   and optional new profile picture upload
   ======================================== */
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

/* ========================================
   REPORT USER
   POST /users/:id/report
   Creates a Report row targeting a user
   ======================================== */
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
