const { User, Post, RSVP, Report, UserWarning, Category, Interest } = require('../models');
const { Op } = require('sequelize');
const { buildOwnProfileViewData, buildOtherProfilePostCards } = require('../services/profileService');

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
    const data = await buildOwnProfileViewData(req.session.userId);
    res.render('users/profile', {
      title: 'My Profile',
      profileUser: data.profileUser,
      posts: data.posts,
      upcomingRsvps: data.upcomingRsvps,
      pastEvents: data.pastEvents,
      drafts: data.drafts,
      rsvpCounts: data.rsvpCounts,
      profileInitials: data.profileInitials,
      profileClientData: data.profileClientData
    });
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
    const now = new Date();
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'location', 'interests', 'profilePic', 'showLocation', 'showInterests']
    });
    if (!user) { req.flash('error', 'User not found.'); return res.redirect('/posts'); }
    const [posts, attendedRsvps, categories] = await Promise.all([
      Post.findAll({
        where: { userId: user.id, isHidden: false, status: 'published' },
        order: [['createdAt', 'DESC']]
      }),
      RSVP.findAll({
        where: { userId: user.id },
        include: [{
          model: Post,
          where: { isHidden: false, status: 'published', date: { [Op.lt]: now } },
          required: true
        }],
        order: [[Post, 'date', 'DESC']]
      }),
      Category.findAll({ order: [['name', 'ASC']] })
    ]);
    const attendedEvents = attendedRsvps.map(r => r.Post);
    const profilePostsCards = buildOtherProfilePostCards(posts);
    res.render('users/otherProfile', {
      title: `${user.name}'s Profile`,
      profileUser: user,
      posts,
      attendedEvents,
      categories,
      profilePostsCards
    });
  } catch (err) { next(err); }
};

exports.addInterestedPost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const post = await Post.findByPk(postId);
    if (!post || post.isHidden || post.status !== 'published') {
      return res.status(404).json({ ok: false, message: 'Post not found' });
    }
    await Interest.findOrCreate({ where: { userId: req.session.userId, postId } });
    return res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.removeInterestedPost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    await Interest.destroy({ where: { userId: req.session.userId, postId } });
    return res.json({ ok: true });
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
    req.flash('reportSuccess', 'Thank you for your report. Our moderators will review it.');
    res.redirect(`/users/${req.params.id}`);
  } catch (err) { next(err); }
};

/* ========================================
   DISMISS WARNINGS
   POST /users/warnings/dismiss
   Marks all unread warnings as read for the
   current user, hiding the red dot indicator
   ======================================== */
exports.dismissWarnings = async (req, res, next) => {
  try {
    await UserWarning.update(
      { isRead: true },
      { where: { userId: req.session.userId, isRead: false } }
    );
    const referer = req.get('Referer') || '/';
    res.redirect(referer);
  } catch (err) { next(err); }
};
