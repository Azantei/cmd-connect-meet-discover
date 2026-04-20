const ROLE_REDIRECTS = {
  community_member: '/users/profile',
  moderator: '/moderator/dashboard',
  admin: '/admin/users'
};

exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.session.userId) return res.redirect(ROLE_REDIRECTS[req.session.role] || '/posts');
  next();
};

exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/login');
  }
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.session.role)) {
    return res.status(403).render('403', { title: 'Access Denied' });
  }
  next();
};

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
