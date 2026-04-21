const { Post, RSVP, Category, Interest, sequelize } = require('../models');

/* ========================================
   GET ALL EVENTS
   GET /events
   Fetches all published, non-hidden posts
   with their author info and RSVP count,
   ordered newest first
   ======================================== */
exports.getAllEvents = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const [posts, categories] = await Promise.all([
      Post.search(q, category),
      Category.findAll({ order: [['name', 'ASC']] })
    ]);

    const postIds = posts.map(post => post.id);
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
      where: { userId: req.session.userId },
      attributes: ['postId'],
      raw: true
    });
    const interestedPostIds = interestedRows.map(row => row.postId);

    res.render('events/index', {
      title: 'Explore Events',
      posts,
      categories,
      interestedPostIds,
      rsvpCounts,
      q: q || '',
      selectedCategory: category || ''
    });
  } catch (err) { next(err); }
};
