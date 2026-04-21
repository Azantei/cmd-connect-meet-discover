const { getEventsData } = require('../services/postService');

exports.getAllEvents = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const data = await getEventsData(req.session.userId, q, category);
    res.render('events/index', {
      title: 'Explore Events',
      ...data,
      q: q || '',
      selectedCategory: category || ''
    });
  } catch (err) { next(err); }
};
