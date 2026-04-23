const postService = require('../services/postService');
const { createPostReport } = require('../services/reportService');

/* ========================================
   FEED & DETAILS VIEWS
   ======================================== */
// Renders the main feed with optional text/category filters.
exports.getFeed = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const data = await postService.getFeedData(q, category);
    res.render('posts/index', {
      title: 'Feed',
      ...data,
      q: q || '',
      selectedCategory: category || '',
      mapboxToken: process.env.MAPBOX_TOKEN || ''
    });
  } catch (err) { next(err); }
};

// Renders a single post page with RSVP/report state for the current user.
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

/* ========================================
   POST CREATION & EDITING
   ======================================== */
// Shows the create form with available categories.
exports.getCreatePost = async (req, res, next) => {
  try {
    const categories = await postService.getCategories();
    res.render('posts/create', { title: 'Create Post', categories });
  } catch (err) { next(err); }
};

// Creates a post from form input and routes based on resulting publish status.
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
    // Drafts stay private and return to the owner's profile workspace.
    if (result.status === 'draft') {
      req.flash('success', 'Draft saved!');
      return res.redirect('/users/profile');
    }
    // Pending posts require moderation before appearing publicly.
    if (result.status === 'pending') {
      req.flash('success', 'Your post is under review and will be published once approved.');
      return res.redirect('/posts');
    }
    req.flash('success', 'Post created!');
    res.redirect(`/posts/${result.post.id}`);
  } catch (err) { next(err); }
};

// Loads an editable post only when the current user is authorized to edit it.
exports.getEditPost = async (req, res, next) => {
  try {
    const { post, error } = await postService.findAuthorizedPost(req.params.id, req.session.userId, req.session.role);
    if (error === 'not_found') { req.flash('error', 'Post not found.'); return res.redirect('/posts'); }
    if (error === 'unauthorized') { req.flash('error', 'Unauthorized.'); return res.redirect(`/posts/${req.params.id}`); }
    const categories = await postService.getCategories();
    res.render('posts/edit', { title: 'Edit Post', post, categories });
  } catch (err) { next(err); }
};

// Persists post edits and redirects based on whether the post remains draft or is published.
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

/* ========================================
   POST DELETION
   ======================================== */
// Deletes a post after ownership/role authorization checks.
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

/* ========================================
   RSVP ACTIONS
   ======================================== */
// Creates an RSVP and sets flash flags used by the post page UI states.
exports.createRsvp = async (req, res, next) => {
  try {
    const result = await postService.createRsvp(req.params.id, req.session.userId);
    if (result.error === 'not_found') return res.redirect('/posts');
    if (result.error) {
      req.flash('error', result.error);
      if (result.errorCode === 'event_full') {
        req.flash('rsvpFull', '1');
      }
    }
    else {
      req.flash('success', result.success);
      req.flash('rsvpConfirmed', '1');
    }
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

// Cancels an RSVP and sets UI flags for cancellation feedback.
exports.deleteRsvp = async (req, res, next) => {
  try {
    await postService.deleteRsvp(req.params.id, req.session.userId);
    req.flash('success', 'RSVP cancelled.');
    req.flash('rsvpCancelled', '1');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

/* ========================================
   REPORTING
   ======================================== */
// Submits a report for a post using a required reason with optional extra context.
exports.reportPost = async (req, res, next) => {
  try {
    const { reason, comment } = req.body;
    const trimmedReason = reason && reason.trim() ? reason.trim() : '';
    const trimmedComment = comment && comment.trim() ? comment.trim() : '';
    // Store reason + optional details in a single human-readable report string.
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
