const { Post, User, Report } = require('../models');

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: { isHidden: false },
      include: [{ model: User, attributes: ['id', 'username', 'profilePic'] }],
      order: [['createdAt', 'DESC']]
    });
    res.render('posts/index', { title: 'Community Posts', posts });
  } catch (err) { next(err); }
};

exports.getCreatePost = (req, res) => {
  res.render('posts/create', { title: 'Create Post' });
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    await Post.create({ title, content, category, userId: req.session.userId });
    req.flash('success', 'Post created!');
    res.redirect('/posts');
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username', 'profilePic'] }]
    });
    if (!post || post.isHidden) { req.flash('error', 'Post not found.'); return res.redirect('/posts'); }
    res.render('posts/show', { title: post.title, post });
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.redirect('/posts');
    const canDelete = req.session.userId === post.userId || ['admin', 'moderator'].includes(req.session.role);
    if (!canDelete) { req.flash('error', 'Unauthorized.'); return res.redirect('/posts'); }
    await post.destroy();
    req.flash('success', 'Post deleted.');
    res.redirect('/posts');
  } catch (err) { next(err); }
};

exports.reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    await Report.create({ postId: req.params.id, reporterId: req.session.userId, reason });
    req.flash('success', 'Report submitted.');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};
