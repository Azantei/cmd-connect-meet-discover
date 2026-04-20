const { Post, User, RSVP } = require('../models');

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
