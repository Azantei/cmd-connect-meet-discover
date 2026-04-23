const { Op } = require('sequelize');
const { User, Post, RSVP, Category, UserWarning } = require('../models');

/* ========================================
   GET OTHER USER PROFILE DATA
   Fetches a user's public info, their posts,
   attended events, and available categories
   ======================================== */
async function getOtherProfileData(userId) {
  const now = new Date();
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'location', 'interests', 'profilePic', 'showLocation', 'showInterests', 'isBanned']
  });
  if (!user) return null;

  const [posts, attendedRsvps, categories] = await Promise.all([
    Post.findAll({ where: { userId: user.id, isHidden: false, status: 'published' }, order: [['createdAt', 'DESC']] }),
    RSVP.findAll({
      where: { userId: user.id },
      include: [{ model: Post, where: { isHidden: false, status: 'published', date: { [Op.lt]: now } }, required: true }],
      order: [[Post, 'date', 'DESC']]
    }),
    Category.findAll({ order: [['name', 'ASC']] })
  ]);

  return {
    profileUser: user,
    posts,
    attendedEvents: attendedRsvps.map(r => r.Post),
    categories
  };
}

// Fetches the user's settings data and all available categories in parallel.
async function getUserSettings(userId) {
  const [user, categories] = await Promise.all([
    User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'location', 'interests', 'profilePic', 'showLocation', 'showInterests']
    }),
    Category.findAll({ order: [['name', 'ASC']] })
  ]);
  return { user, categories };
}

// Validates and persists profile changes (name, password, interests, location, privacy flags, avatar).
async function updateUserSettings(userId, body, imageFile) {
  const { location, interests, newPassword, confirmPassword, showLocation, showInterests } = body;
  const rawName = Array.isArray(body.name) ? body.name[0] : body.name;

  if (newPassword && newPassword.trim()) {
    if (newPassword !== confirmPassword) return { error: 'Passwords do not match.' };
    if (newPassword.length < 8) return { error: 'Password must be at least 8 characters.' };
  }

  const user = await User.findByPk(userId);
  if (rawName && rawName.trim()) user.name = rawName.trim();
  if (location !== undefined) user.location = location || null;
  if (interests !== undefined && interests !== '') {
    user.interests = Array.isArray(interests)
      ? interests
      : interests.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (showLocation !== undefined) user.showLocation = showLocation === '1';
  if (showInterests !== undefined) user.showInterests = showInterests === '1';
  if (imageFile) user.profilePic = `/uploads/${imageFile.filename}`;
  if (newPassword && newPassword.trim()) user.password = newPassword;
  await user.save();

  return { success: 'Settings updated.', updatedName: rawName && rawName.trim() ? rawName.trim() : null };
}

// Marks all unread warnings as read for the given user.
async function dismissWarnings(userId) {
  await UserWarning.update({ isRead: true }, { where: { userId, isRead: false } });
}

module.exports = { getOtherProfileData, getUserSettings, updateUserSettings, dismissWarnings };
