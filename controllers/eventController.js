const { Post, User, RSVP } = require('../models');

/* ========================================
   GET ALL EVENTS
   GET /events
   Fetches all published, non-hidden posts
   with their author info and RSVP count,
   ordered newest first
   ======================================== */
exports.getAllEvents = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: { isHidden: false, status: 'published' },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: RSVP, attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.render('events/index', { title: 'Explore Events', posts });
  } catch (err) { next(err); }
};
