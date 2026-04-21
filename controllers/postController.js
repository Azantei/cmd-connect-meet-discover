const postService = require('../services/postService');
const { createPostReport } = require('../services/reportService');

exports.getFeed = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const data = await postService.getFeedData(q, category);
    res.render('posts/index', { title: 'Feed', ...data, q: q || '', selectedCategory: category || '' });
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const data = await postService.getPostWithDetails(req.params.id, req.session.userId);
    if (!data) {
      req.flash('error', 'Post not found.');
      return res.redirect('/posts');
    }
    res.render('posts/show', { title: data.post.title, ...data });
  } catch (err) { next(err); }
};

exports.getCreatePost = async (req, res, next) => {
  try {
    const categories = await postService.getCategories();
    res.render('posts/create', { title: 'Create Post', categories });
  } catch (err) { next(err); }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      req.flash('error', 'Title is required.');
      return res.redirect('/posts/new');
    }
    const result = await postService.createPost({ ...req.body, imageFile: req.file, userId: req.session.userId });
    if (result.error) {
      req.flash('error', result.error);
      return res.redirect('/posts/new');
    }
    if (result.status === 'draft') {
      req.flash('success', 'Draft saved!');
      return res.redirect('/users/profile');
    }
    if (result.status === 'pending') {
      req.flash('success', 'Your post is under review and will be published once approved.');
      return res.redirect('/posts');
    }
    req.flash('success', 'Post created!');
    res.redirect(`/posts/${result.post.id}`);
  } catch (err) { next(err); }
};

exports.getEditPost = async (req, res, next) => {
  try {
    const { post, error } = await postService.findAuthorizedPost(req.params.id, req.session.userId, req.session.role);
    if (error === 'not_found') { req.flash('error', 'Post not found.'); return res.redirect('/posts'); }
    if (error === 'unauthorized') { req.flash('error', 'Unauthorized.'); return res.redirect(`/posts/${req.params.id}`); }
    const categories = await postService.getCategories();
    res.render('posts/edit', { title: 'Edit Post', post, categories });
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { post, error } = await postService.findAuthorizedPost(req.params.id, req.session.userId, req.session.role);
    if (error === 'not_found') { req.flash('error', 'Post not found.'); return res.redirect('/posts'); }
    if (error === 'unauthorized') { req.flash('error', 'Unauthorized.'); return res.redirect(`/posts/${req.params.id}`); }
    const { status } = await postService.updatePost(post, { ...req.body, imageFile: req.file });
    if (status === 'draft') {
      req.flash('success', 'Draft saved.');
      return res.redirect('/users/profile');
    }
    req.flash('success', 'Post published!');
    res.redirect(`/posts/${post.id}`);
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { post, error } = await postService.findAuthorizedPost(req.params.id, req.session.userId, req.session.role);
    if (error === 'not_found') { req.flash('error', 'Post not found.'); return res.redirect('/posts'); }
    if (error === 'unauthorized') { req.flash('error', 'Unauthorized.'); return res.redirect(`/posts/${req.params.id}`); }
    await postService.deletePost(post);
    req.flash('success', 'Post deleted.');
    res.redirect('/users/profile');
  } catch (err) { next(err); }
};

exports.createRsvp = async (req, res, next) => {
  try {
    const result = await postService.createRsvp(req.params.id, req.session.userId);
    if (result.error === 'not_found') return res.redirect('/posts');
    if (result.error) req.flash('error', result.error);
    else req.flash('success', result.success);
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

exports.deleteRsvp = async (req, res, next) => {
  try {
    await postService.deleteRsvp(req.params.id, req.session.userId);
    req.flash('success', 'RSVP cancelled.');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

exports.reportPost = async (req, res, next) => {
  try {
    const { reason, comment } = req.body;
    const trimmedReason = reason && reason.trim() ? reason.trim() : '';
    const trimmedComment = comment && comment.trim() ? comment.trim() : '';
    const fullReason = trimmedReason && trimmedComment
      ? `${trimmedReason} — ${trimmedComment}`
      : trimmedReason || trimmedComment;
    if (!fullReason) {
      req.flash('error', 'A reason is required.');
      return res.redirect(`/posts/${req.params.id}`);
    }
    await createPostReport(req.session.userId, req.params.id, fullReason);
    req.flash('reportSuccess', 'Thank you for your report. Our moderators will review it.');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};
