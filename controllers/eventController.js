const { Post, User, RSVP } = require('../models');
const { Op } = require('sequelize');

exports.getAllEvents = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: { isHidden: false, status: 'published' },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.render('events/index', { title: 'Explore Events', posts });
  } catch (err) { next(err); }
};

exports.getCreateEvent = (req, res) => {
  res.redirect('/posts/create');
};

exports.createEvent = (req, res) => {
  res.redirect('/posts/create');
};

exports.getEvent = (req, res) => {
  res.redirect('/posts/' + req.params.id);
};

exports.deleteEvent = (req, res) => {
  res.redirect('/events');
};
