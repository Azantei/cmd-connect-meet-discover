const ROLE_REDIRECTS = {
  community_member: '/users/profile',
  moderator: '/moderator/dashboard',
  admin: '/admin/users'
};

/* ========================================
   REDIRECT IF LOGGED IN
   Sends already-authenticated users to their
   role's home page instead of showing the
   login/register forms again
   ======================================== */
exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.session.userId) return res.redirect(ROLE_REDIRECTS[req.session.role] || '/posts');
  next();
};

/* ========================================
   REQUIRE AUTH
   Blocks unauthenticated requests and
   redirects to login with a flash message
   ======================================== */
exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/login');
  }
  next();
};

/* ========================================
   REQUIRE ROLE
   Factory that returns a middleware enforcing
   one or more allowed roles; renders 403 if
   the session role is not in the list
   ======================================== */
exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.session.role)) {
    return res.status(403).render('403', { title: 'Access Denied' });
  }
  next();
};
