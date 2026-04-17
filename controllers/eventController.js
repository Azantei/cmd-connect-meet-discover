const { Event, User } = require('../models');

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      include: [{ model: User, as: 'organizer', attributes: ['id', 'username'] }],
      order: [['eventDate', 'ASC']]
    });
    res.render('events/index', { title: 'Events', events });
  } catch (err) { next(err); }
};

exports.getCreateEvent = (req, res) => {
  res.render('events/create', { title: 'Create Event' });
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, location, eventDate, category } = req.body;
    await Event.create({ title, description, location, eventDate, category, organizerId: req.session.userId });
    req.flash('success', 'Event created!');
    res.redirect('/events');
  } catch (err) { next(err); }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: User, as: 'organizer', attributes: ['id', 'username'] }]
    });
    if (!event) { req.flash('error', 'Event not found.'); return res.redirect('/events'); }
    res.render('events/show', { title: event.title, event });
  } catch (err) { next(err); }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.redirect('/events');
    const canDelete = req.session.userId === event.organizerId || req.session.role === 'admin';
    if (!canDelete) { req.flash('error', 'Unauthorized.'); return res.redirect('/events'); }
    await event.destroy();
    req.flash('success', 'Event deleted.');
    res.redirect('/events');
  } catch (err) { next(err); }
};
