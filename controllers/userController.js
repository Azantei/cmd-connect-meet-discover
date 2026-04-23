const { buildOwnProfileData } = require('../services/profileService');
const { getInitials, buildProfileClientData, buildOtherProfilePostCards } = require('../presenters/profilePresenter');
const userService = require('../services/userService');
const { createUserReport } = require('../services/reportService');
const { addInterest, removeInterest } = require('../services/postService');

/* ========================================
   PROFILE VIEWS
   ======================================== */
exports.getOwnProfile = async (req, res, next) => {
  try {
    const data = await buildOwnProfileData(req.session.userId);
    res.render('users/profile', {
      title: 'My Profile',
      profileUser: data.profileUser,
      posts: data.posts,
      upcomingRsvps: data.upcomingRsvps,
      pastEvents: data.pastEvents,
      drafts: data.drafts,
      rsvpCounts: data.rsvpCounts,
      profileInitials: getInitials(data.profileUser && data.profileUser.name),
      profileClientData: buildProfileClientData(data)
    });
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const data = await userService.getOtherProfileData(req.params.id);
    if (!data) { req.flash('error', 'User not found.'); return res.redirect('/posts'); }
    res.render('users/otherProfile', {
      title: `${data.profileUser.name}'s Profile`,
      ...data,
      profilePostsCards: buildOtherProfilePostCards(data.posts)
    });
  } catch (err) { next(err); }
};

exports.getSettings = async (req, res, next) => {
  try {
    const { user, categories } = await userService.getUserSettings(req.session.userId);
    res.render('users/settings', { title: 'Settings', user, categories });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const result = await userService.updateUserSettings(req.session.userId, req.body, req.file);
    if (result.error) {
      req.flash('error', result.error);
      return res.redirect('/users/settings');
    }
    if (result.updatedName) req.session.username = result.updatedName;
    req.flash('success', result.success);
    res.redirect('/users/profile');
  } catch (err) { next(err); }
};

/* ========================================
   INTEREST ACTIONS
   ======================================== */
exports.addInterestedPost = async (req, res, next) => {
  try {
    const result = await addInterest(req.session.userId, parseInt(req.params.postId, 10));
    if (result.error) return res.status(404).json({ ok: false, message: result.error });
    return res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.removeInterestedPost = async (req, res, next) => {
  try {
    await removeInterest(req.session.userId, parseInt(req.params.postId, 10));
    return res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.reportUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      req.flash('error', 'A reason is required.');
      return res.redirect(`/users/${req.params.id}`);
    }
    await createUserReport(req.session.userId, req.params.id, reason.trim());
    req.flash('reportSuccess', 'Thank you for your report. Our moderators will review it.');
    res.redirect(`/users/${req.params.id}`);
  } catch (err) { next(err); }
};

exports.dismissWarnings = async (req, res, next) => {
  try {
    await userService.dismissWarnings(req.session.userId);
    res.redirect(req.get('Referer') || '/');
  } catch (err) { next(err); }
};
