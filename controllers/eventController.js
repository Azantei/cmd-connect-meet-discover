const { getEventsData } = require('../services/postService');

exports.getAllEvents = async (req, res, next) => {
  try {
    const { q, dateFrom, dateTo } = req.query;
    const raw = req.query.category;
    const categories = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    let effectiveDateFrom = dateFrom || '';
    let effectiveDateTo = dateTo || '';
    let dateRangeError = '';

    if (effectiveDateFrom && effectiveDateTo) {
      const from = new Date(effectiveDateFrom);
      const to = new Date(effectiveDateTo);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from > to) {
        dateRangeError = 'Start date must be on or before end date. Date filter was not applied.';
        effectiveDateFrom = '';
        effectiveDateTo = '';
      }
    }

    const data = await getEventsData(req.session.userId, q, categories, effectiveDateFrom, effectiveDateTo);
    res.render('events/index', {
      title: 'Explore Events',
      ...data,
      q: q || '',
      selectedCategories: categories,
      dateFrom: effectiveDateFrom,
      dateTo: effectiveDateTo,
      dateRangeError
    });
  } catch (err) { next(err); }
};
