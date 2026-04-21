const { Op } = require('sequelize');
const { User, Post, RSVP, sequelize, Interest } = require('../models');

/* ========================================
   BUILD OWN PROFILE DATA
   Fetches and assembles all raw data needed
   for the logged-in user's profile page.
   Presentation formatting is handled by
   profilePresenter before rendering.
   ======================================== */
async function buildOwnProfileData(userId) {
  const now = new Date();
  const [profileUser, posts, rsvps, drafts, pastCreated] = await Promise.all([
    User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'location', 'interests', 'role', 'profilePic']
    }),
    Post.findAll({ where: { userId, isHidden: false, status: 'published' }, order: [['createdAt', 'DESC']] }),
    RSVP.findAll({
      where: { userId },
      include: [{ model: Post, where: { isHidden: false, status: 'published' }, required: true }],
      order: [['createdAt', 'DESC']]
    }),
    Post.findAll({ where: { userId, status: 'draft' }, order: [['createdAt', 'DESC']] }),
    Post.findAll({
      where: { userId, type: 'event', status: 'published', isHidden: false, date: { [Op.lt]: now } },
      order: [['date', 'DESC']]
    })
  ]);

  const upcomingRsvps = rsvps.filter(r => !r.Post.date || new Date(r.Post.date) > now);
  const pastRsvpPosts = rsvps.filter(r => r.Post.date && new Date(r.Post.date) <= now).map(r => r.Post);
  const pastRsvpIds = new Set(pastRsvpPosts.map(p => p.id));
  const pastEvents = [...pastRsvpPosts, ...pastCreated.filter(p => !pastRsvpIds.has(p.id))];

  const allPostIds = [
    ...posts.map(p => p.id),
    ...rsvps.map(r => r.Post.id),
    ...pastCreated.map(p => p.id),
    ...drafts.map(p => p.id)
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

  const interestedRows = await Interest.findAll({
    where: { userId },
    include: [{ model: Post, as: 'post', where: { isHidden: false, status: 'published' }, required: true }],
    order: [['createdAt', 'DESC']]
  });

  return {
    profileUser,
    posts,
    upcomingRsvps,
    pastEvents,
    drafts,
    rsvpCounts,
    interestedPosts: interestedRows.map(row => row.post)
  };
}

module.exports = { buildOwnProfileData };
