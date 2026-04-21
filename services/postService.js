const { Post, User, RSVP, Report, Category, Interest, sequelize } = require('../models');
const { normalizeCategoryArray, parseCombinedDate } = require('../utils/helpers');
const { getPostStatus, createAutoModerationReport } = require('./postModerationService');

/* ========================================
   FIND AUTHORIZED POST
   Fetches a post and verifies the requesting
   user is the owner or a staff member.
   Returns { post, error } where error is
   'not_found' or 'unauthorized', or null.
   ======================================== */
async function findAuthorizedPost(postId, userId, role) {
  const post = await Post.findByPk(postId);
  if (!post) return { post: null, error: 'not_found' };
  const isOwner = userId === post.userId;
  const isStaff = ['admin', 'moderator'].includes(role);
  if (!isOwner && !isStaff) return { post: null, error: 'unauthorized' };
  return { post, error: null };
}

async function getPostWithDetails(postId, userId) {
  const post = await Post.findByPk(postId, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
  });
  if (!post || post.isHidden) return null;

  const [rsvpCount, existingRsvp, existingInterest] = await Promise.all([
    RSVP.count({ where: { postId: post.id } }),
    userId ? RSVP.findOne({ where: { postId: post.id, userId } }) : Promise.resolve(null),
    userId ? Interest.findOne({ where: { postId: post.id, userId } }) : Promise.resolve(null)
  ]);

  return { post, rsvpCount, hasRsvp: !!existingRsvp, isInterested: !!existingInterest };
}

async function getFeedData(q, category) {
  const cats = category ? [category] : [];
  const [posts, categories] = await Promise.all([
    Post.search(q, cats),
    Category.findAll({ order: [['name', 'ASC']] })
  ]);
  return { posts, categories };
}

async function getCategories() {
  return Category.findAll({ order: [['name', 'ASC']] });
}

async function createPost({ title, description, category, location, date, time, rsvpEnabled, maxAttendees, status: requestedStatus, imageFile, userId }) {
  const combinedDate = parseCombinedDate(date, time);
  if (combinedDate && combinedDate < new Date()) {
    return { error: 'Event date must be in the future.' };
  }
  const categoryArray = normalizeCategoryArray(category);
  const isEvent = rsvpEnabled === 'on';
  const status = getPostStatus({ requestedStatus, title: title.trim(), description });

  const post = await Post.create({
    title: title.trim(),
    description: description || null,
    category: categoryArray,
    location: location || null,
    date: combinedDate,
    imageUrl: imageFile ? `/uploads/${imageFile.filename}` : null,
    userId,
    type: isEvent ? 'event' : 'activity',
    status,
    rsvpEnabled: isEvent,
    maxAttendees: (isEvent && maxAttendees) ? parseInt(maxAttendees) : null
  });

  if (status === 'pending') {
    await createAutoModerationReport({ postId: post.id, reporterId: userId });
  }
  return { post, status };
}

async function updatePost(existingPost, { title, description, category, location, date, time, rsvpEnabled, maxAttendees, status: requestedStatus, imageFile }) {
  const categoryArray = normalizeCategoryArray(category);
  const status = requestedStatus === 'draft' ? 'draft' : 'published';
  const combinedDate = parseCombinedDate(date, time);
  const isEvent = rsvpEnabled === 'on';

  await existingPost.update({
    title: title && title.trim() ? title.trim() : existingPost.title,
    description: description || null,
    category: categoryArray,
    location: location || null,
    date: combinedDate,
    imageUrl: imageFile ? `/uploads/${imageFile.filename}` : existingPost.imageUrl,
    type: isEvent ? 'event' : 'activity',
    status,
    rsvpEnabled: isEvent,
    maxAttendees: (isEvent && maxAttendees) ? parseInt(maxAttendees) : null
  });
  return { status };
}

async function deletePost(post) {
  await post.destroy();
  await Report.update(
    { status: 'resolved', notes: 'Auto-dismissed: post deleted by author.' },
    { where: { targetType: 'post', targetId: post.id, status: 'pending' } }
  );
}

async function createRsvp(postId, userId) {
  const post = await Post.findByPk(postId);
  if (!post) return { error: 'not_found' };
  if (post.date && new Date(post.date) < new Date()) return { error: 'This event has already taken place.' };
  if (post.rsvpEnabled && post.maxAttendees) {
    const count = await RSVP.count({ where: { postId: post.id } });
    if (count >= post.maxAttendees) return { error: 'This event is full.' };
  }
  await RSVP.findOrCreate({ where: { postId, userId } });
  return { success: 'RSVP confirmed!' };
}

async function deleteRsvp(postId, userId) {
  await RSVP.destroy({ where: { postId, userId } });
}

async function getEventsData(userId, q, selectedCategories, dateFrom, dateTo) {
  const [posts, categories] = await Promise.all([
    Post.search(q, selectedCategories || [], dateFrom, dateTo),
    Category.findAll({ order: [['name', 'ASC']] })
  ]);

  const postIds = posts.map(p => p.id);
  const rsvpCounts = {};
  if (postIds.length > 0) {
    const rows = await RSVP.findAll({
      where: { postId: postIds },
      attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['postId'],
      raw: true
    });
    rows.forEach(row => { rsvpCounts[row.postId] = parseInt(row.count, 10); });
  }

  const interestedRows = await Interest.findAll({
    where: { userId },
    attributes: ['postId'],
    raw: true
  });

  return { posts, categories, rsvpCounts, interestedPostIds: interestedRows.map(r => r.postId) };
}

async function addInterest(userId, postId) {
  const post = await Post.findByPk(postId);
  if (!post || post.isHidden || post.status !== 'published') return { error: 'Post not found' };
  await Interest.findOrCreate({ where: { userId, postId } });
  return { ok: true };
}

async function removeInterest(userId, postId) {
  await Interest.destroy({ where: { userId, postId } });
  return { ok: true };
}

module.exports = {
  findAuthorizedPost, getPostWithDetails, getFeedData, getCategories,
  createPost, updatePost, deletePost,
  createRsvp, deleteRsvp,
  getEventsData, addInterest, removeInterest
};
