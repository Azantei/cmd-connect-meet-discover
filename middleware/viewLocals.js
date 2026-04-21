const { getUnreadWarningsForUser } = require('../services/warningService');

exports.injectBaseLocals = (req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  res.locals.currentRole = req.session.role || null;
  res.locals.currentUsername = req.session.username || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.reportSuccess = req.flash('reportSuccess');
  res.locals.loginError = req.flash('loginError');
  res.locals.loginEmail = req.flash('loginEmail')[0] || '';
  res.locals.catSuccess = req.flash('catSuccess');
  res.locals.userWarnings = [];
  next();
};

exports.attachUnreadWarnings = async (req, res, next) => {
  if (!req.session.userId) return next();
  try {
    res.locals.userWarnings = await getUnreadWarningsForUser(req.session.userId);
  } catch (_) {
    // Ignore warning lookup failures to avoid breaking page rendering.
  }
  next();
};
