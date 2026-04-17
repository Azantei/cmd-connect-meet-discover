exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/login');
  }
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.session.role)) {
    req.flash('error', 'Access denied.');
    return res.redirect('/');
  }
  next();
};
