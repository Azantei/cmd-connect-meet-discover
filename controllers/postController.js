const { Op } = require('sequelize');
const { Post, User, RSVP, Report, Category } = require('../models');

exports.getFeed = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const where = { isHidden: false };

    if (q && q.trim()) {
      where[Op.or] = [
        { title:       { [Op.like]: `%${q.trim()}%` } },
        { description: { [Op.like]: `%${q.trim()}%` } }
      ];
    }
    if (category && category.trim()) {
      const safe = category.trim().replace(/["%_\\]/g, '\\$&');
      where.category = { [Op.like]: `%"${safe}"%` };
    }

    const [posts, categories] = await Promise.all([
      Post.findAll({
        where,
        include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      }),
      Category.findAll({ order: [['name', 'ASC']] })
    ]);

    res.render('posts/index', {
      title: 'Feed',
      posts,
      categories,
      q: q || '',
      selectedCategory: category || ''
    });
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
    });
    if (!post || post.isHidden) {
      req.flash('error', 'Post not found.');
      return res.redirect('/feed');
    }

    const [rsvpCount, existingRsvp] = await Promise.all([
      RSVP.count({ where: { postId: post.id } }),
      req.session.userId
        ? RSVP.findOne({ where: { postId: post.id, userId: req.session.userId } })
        : Promise.resolve(null)
    ]);

    res.render('posts/show', {
      title: post.title,
      post,
      rsvpCount,
      hasRsvp: !!existingRsvp
    });
  } catch (err) { next(err); }
};

exports.getCreatePost = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('posts/create', { title: 'Create Post', categories });
  } catch (err) { next(err); }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, description, category, location, date } = req.body;
    if (!title || !title.trim()) {
      req.flash('error', 'Title is required.');
      return res.redirect('/posts/new');
    }
    const categoryArray = Array.isArray(category)
      ? category
      : (category ? [category] : []);

    const post = await Post.create({
      title: title.trim(),
      description: description || null,
      category: categoryArray,
      location: location || null,
      date: date || null,
      userId: req.session.userId
    });
    req.flash('success', 'Post created!');
    res.redirect(`/posts/${post.id}`);
  } catch (err) { next(err); }
};

exports.createRsvp = async (req, res, next) => {
  try {
    await RSVP.findOrCreate({
      where: { postId: req.params.id, userId: req.session.userId }
    });
    req.flash('success', 'RSVP confirmed!');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

exports.deleteRsvp = async (req, res, next) => {
  try {
    await RSVP.destroy({ where: { postId: req.params.id, userId: req.session.userId } });
    req.flash('success', 'RSVP cancelled.');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.redirect('/feed');
    const canDelete = req.session.userId === post.userId ||
      ['admin', 'moderator'].includes(req.session.role);
    if (!canDelete) {
      req.flash('error', 'Unauthorized.');
      return res.redirect(`/posts/${post.id}`);
    }
    await post.destroy();
    req.flash('success', 'Post deleted.');
    res.redirect('/feed');
  } catch (err) { next(err); }
};

exports.reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      req.flash('error', 'A reason is required.');
      return res.redirect(`/posts/${req.params.id}`);
    }
    await Report.create({
      reporterId: req.session.userId,
      targetType: 'post',
      targetId:   req.params.id,
      reason:     reason.trim()
    });
    req.flash('success', 'Report submitted. Thank you.');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};
