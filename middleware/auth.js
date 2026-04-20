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

/* ========================================
   CAN MODIFY POST
   Fetches the post by :id param, then allows
   the request through only if the session
   user is the post owner OR has staff role.
   Attaches the post to req.post for the
   controller to use without a second query.
   ======================================== */
exports.canModifyPost = async (req, res, next) => {
  try {
    const { Post } = require('../models');
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      req.flash('error', 'Post not found.');
      return res.redirect('/posts');
    }
    const isOwner = req.session.userId === post.userId;
    const isStaff = ['admin', 'moderator'].includes(req.session.role);
    if (!isOwner && !isStaff) {
      req.flash('error', 'Unauthorized.');
      return res.redirect(`/posts/${post.id}`);
    }
    req.post = post;
    next();
  } catch (err) { next(err); }
};
