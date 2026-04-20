const { Post, User, RSVP, Report, Category } = require('../models');
const { normalizeCategoryArray, parseCombinedDate } = require('../utils/helpers');

const PROFANITY_RE = /\b(fuck|shit|ass)\b/i;

/* ========================================
   FEED
   GET /posts
   Searches published posts by optional
   ?q (text) and ?category query params,
   loads all categories for the filter bar
   ======================================== */
exports.getFeed = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const [posts, categories] = await Promise.all([
      Post.search(q, category),
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

/* ========================================
   SINGLE POST VIEW
   GET /posts/:id
   Fetches one post by PK with its author,
   plus the RSVP count and whether the
   current session user has already RSVP'd
   ======================================== */
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
    });
    if (!post || post.isHidden) {
      req.flash('error', 'Post not found.');
      return res.redirect('/posts');
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

/* ========================================
   CREATE POST FORM
   GET /posts/new  (also /posts/create)
   Fetches all categories to populate the
   tag-picker in the form
   ======================================== */
exports.getCreatePost = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('posts/create', { title: 'Create Post', categories });
  } catch (err) { next(err); }
};

/* ========================================
   CREATE POST
   POST /posts
   Inserts a new post row; handles optional
   image upload, date+time combination,
   RSVP settings, and draft vs published status
   ======================================== */
exports.createPost = async (req, res, next) => {
  try {
    const { title, description, category, location, date, time, rsvpEnabled, maxAttendees } = req.body;
    if (!title || !title.trim()) {
      req.flash('error', 'Title is required.');
      return res.redirect('/posts/new');
    }

    const combinedDate = parseCombinedDate(date, time);
    if (combinedDate && combinedDate < new Date()) {
      req.flash('error', 'Event date must be in the future.');
      return res.redirect('/posts/new');
    }

    const hasProfanity = PROFANITY_RE.test(title.trim()) ||
                         (description && PROFANITY_RE.test(description));

    const categoryArray = normalizeCategoryArray(category);
    const isEvent = rsvpEnabled === 'on';

    let status;
    if (req.body.status === 'draft') {
      status = 'draft';
    } else if (hasProfanity) {
      status = 'pending';
    } else {
      status = 'published';
    }

    const post = await Post.create({
      title:        title.trim(),
      description:  description || null,
      category:     categoryArray,
      location:     location || null,
      date:         combinedDate,
      imageUrl:     req.file ? `/uploads/${req.file.filename}` : null,
      userId:       req.session.userId,
      type:         isEvent ? 'event' : 'activity',
      status,
      rsvpEnabled:  isEvent,
      maxAttendees: (isEvent && maxAttendees) ? parseInt(maxAttendees) : null
    });

    if (status === 'draft') {
      req.flash('success', 'Draft saved!');
      return res.redirect('/users/profile');
    }
    if (status === 'pending') {
      await Report.create({
        reporterId: req.session.userId,
        targetType: 'post',
        targetId:   post.id,
        reason:     'Auto-flagged by content filter: potential profanity detected.'
      });
      req.flash('success', 'Your post is under review and will be published once approved.');
      return res.redirect('/posts');
    }
    req.flash('success', 'Post created!');
    res.redirect(`/posts/${post.id}`);
  } catch (err) { next(err); }
};

/* ========================================
   EDIT POST FORM
   GET /posts/:id/edit
   Renders the edit form pre-populated with
   the existing post (attached to req.post
   by the canModifyPost middleware)
   ======================================== */
exports.getEditPost = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('posts/edit', { title: 'Edit Post', post: req.post, categories });
  } catch (err) { next(err); }
};

/* ========================================
   UPDATE POST
   POST /posts/:id/edit
   Updates the post row with new field values;
   replaces the image only if a new file was
   uploaded, otherwise keeps the existing one
   ======================================== */
exports.updatePost = async (req, res, next) => {
  try {
    const post = req.post;
    const { title, description, category, location, date, time, rsvpEnabled, maxAttendees } = req.body;
    const categoryArray = normalizeCategoryArray(category);
    const status = req.body.status === 'draft' ? 'draft' : 'published';
    const combinedDate = parseCombinedDate(date, time);

    const isEvent = rsvpEnabled === 'on';
    await post.update({
      title:        title && title.trim() ? title.trim() : post.title,
      description:  description || null,
      category:     categoryArray,
      location:     location || null,
      date:         combinedDate,
      imageUrl:     req.file ? `/uploads/${req.file.filename}` : post.imageUrl,
      type:         isEvent ? 'event' : 'activity',
      status,
      rsvpEnabled:  isEvent,
      maxAttendees: (isEvent && maxAttendees) ? parseInt(maxAttendees) : null
    });

    if (status === 'draft') {
      req.flash('success', 'Draft saved.');
      return res.redirect('/users/profile');
    }
    req.flash('success', 'Post published!');
    res.redirect(`/posts/${post.id}`);
  } catch (err) { next(err); }
};

/* ========================================
   CREATE RSVP
   POST /posts/:id/rsvp
   Adds the current user's RSVP; enforces
   event-not-past and max-attendees checks
   before inserting via findOrCreate
   ======================================== */
exports.createRsvp = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.redirect('/posts');

    if (post.date && new Date(post.date) < new Date()) {
      req.flash('error', 'This event has already taken place.');
      return res.redirect(`/posts/${req.params.id}`);
    }

    if (post.rsvpEnabled && post.maxAttendees) {
      const count = await RSVP.count({ where: { postId: post.id } });
      if (count >= post.maxAttendees) {
        req.flash('error', 'This event is full.');
        return res.redirect(`/posts/${req.params.id}`);
      }
    }

    await RSVP.findOrCreate({
      where: { postId: req.params.id, userId: req.session.userId }
    });
    req.flash('success', 'RSVP confirmed!');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

/* ========================================
   DELETE RSVP
   DELETE /posts/:id/rsvp
   Removes the current user's RSVP row
   ======================================== */
exports.deleteRsvp = async (req, res, next) => {
  try {
    await RSVP.destroy({ where: { postId: req.params.id, userId: req.session.userId } });
    req.flash('success', 'RSVP cancelled.');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};

/* ========================================
   DELETE POST
   DELETE /posts/:id
   Destroys the post and auto-resolves any
   pending reports that referenced it
   ======================================== */
exports.deletePost = async (req, res, next) => {
  try {
    const post = req.post;
    await post.destroy();
    await Report.update(
      { status: 'resolved', notes: 'Auto-dismissed: post deleted by author.' },
      { where: { targetType: 'post', targetId: post.id, status: 'pending' } }
    );
    req.flash('success', 'Post deleted.');
    res.redirect('/users/profile');
  } catch (err) { next(err); }
};

/* ========================================
   REPORT POST
   POST /posts/:id/report
   Creates a new Report row; combines the
   selected reason dropdown value and optional
   free-text comment into a single reason string
   ======================================== */
exports.reportPost = async (req, res, next) => {
  try {
    const { reason, comment } = req.body;
    const trimmedReason  = reason  && reason.trim()  ? reason.trim()  : '';
    const trimmedComment = comment && comment.trim() ? comment.trim() : '';
    const fullReason = trimmedReason && trimmedComment
      ? `${trimmedReason} — ${trimmedComment}`
      : trimmedReason || trimmedComment;

    if (!fullReason) {
      req.flash('error', 'A reason is required.');
      return res.redirect(`/posts/${req.params.id}`);
    }
    await Report.create({
      reporterId: req.session.userId,
      targetType: 'post',
      targetId:   req.params.id,
      reason:     fullReason
    });
    req.flash('reportSuccess', 'Thank you for your report. Our moderators will review it.');
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) { next(err); }
};
