const { getEventsData } = require('../services/postService');

exports.getAllEvents = async (req, res, next) => {
  try {
    const { q, dateFrom, dateTo } = req.query;
    const raw = req.query.category;
    const categories = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    const data = await getEventsData(req.session.userId, q, categories, dateFrom, dateTo);
    res.render('events/index', {
      title: 'Explore Events',
      ...data,
      q: q || '',
      selectedCategories: categories,
      dateFrom: dateFrom || '',
      dateTo: dateTo || ''
    });
  } catch (err) { next(err); }
};
