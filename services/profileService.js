const { Op } = require('sequelize');
const { User, Post, RSVP, sequelize, Interest } = require('../models');

function getInitials(name) {
  const parts = (name || '').split(' ').filter(Boolean);
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
}

function toCard(post, defaults, extra) {
  return {
    id: post.id,
    title: post.title || '',
    desc: post.description || '',
    date: post.date ? new Date(post.date).toDateString() : 'Date TBD',
    tags: Array.isArray(post.category) ? post.category : [],
    imageUrl: post.imageUrl || null,
    ...defaults,
    ...extra
  };
}

function buildOtherProfilePostCards(posts) {
  const colors = ['#2e3a4e', '#3b4a2e', '#3b2e4a', '#4a3b2e', '#2e4a3b'];
  return posts.map((p, i) => ({
    id: p.id,
    title: p.title || '',
    desc: p.description || '',
    date: p.date ? new Date(p.date).toDateString() : 'Date not set',
    color: colors[i % colors.length],
    tags: Array.isArray(p.category) ? p.category : [],
    imageUrl: p.imageUrl || null
  }));
}

async function buildOwnProfileViewData(userId) {
  const now = new Date();
  const [profileUser, posts, rsvps, drafts, pastCreated] = await Promise.all([
    User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'location', 'interests', 'role', 'profilePic']
    }),
    Post.findAll({
      where: { userId, isHidden: false, status: 'published' },
      order: [['createdAt', 'DESC']]
    }),
    RSVP.findAll({
      where: { userId },
      include: [{ model: Post, where: { isHidden: false, status: 'published' }, required: true }],
      order: [['createdAt', 'DESC']]
    }),
    Post.findAll({
      where: { userId, status: 'draft' },
      order: [['createdAt', 'DESC']]
    }),
    Post.findAll({
      where: {
        userId,
        type: 'event',
        status: 'published',
        isHidden: false,
        date: { [Op.lt]: now }
      },
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
  const interestedPosts = interestedRows.map(row => row.post);

  const profileClientData = {
    myPosts: posts.map(p => toCard(p, { color: '#2e3a4e' }, {
      going: rsvpCounts[p.id] || 0,
      maxAttendees: p.maxAttendees || null,
      status: 'Published'
    })),
    upcomingEvents: upcomingRsvps.map(r => {
      const p = r.Post || {};
      return toCard(p, { color: '#3b4a2e' }, {
        going: rsvpCounts[p.id] || 0,
        maxAttendees: p.maxAttendees || null,
        rsvp: 'Going'
      });
    }),
    previousEvents: pastEvents.map(p => toCard(p, { color: '#2e3a4e' }, {
      going: rsvpCounts[p.id] || 0,
      maxAttendees: p.maxAttendees || null,
      type: 'attended'
    })),
    interestedEvents: interestedPosts.map(p => toCard(p, { color: '#f57c00' }, {
      going: rsvpCounts[p.id] || 0,
      maxAttendees: p.maxAttendees || null
    })),
    drafts: drafts.map(p => toCard(p, { color: '#3b3b3b' }, {
      going: 0,
      status: 'Draft',
      date: 'Draft'
    }))
  };

  return {
    profileUser,
    posts,
    upcomingRsvps,
    pastEvents,
    drafts,
    rsvpCounts,
    profileInitials: getInitials(profileUser && profileUser.name),
    profileClientData
  };
}

module.exports = {
  buildOwnProfileViewData,
  buildOtherProfilePostCards,
  getInitials
};
