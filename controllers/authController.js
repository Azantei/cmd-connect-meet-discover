const bcrypt = require('bcrypt');
const { User, Category } = require('../models');

/* ========================================
   ROLE-BASED REDIRECT MAP
   After login, each role lands on its
   own home page
   ======================================== */
const ROLE_REDIRECTS = {
  community_member: '/users/profile',
  moderator: '/moderator/dashboard',
  admin: '/admin/users'
};

/* ========================================
   PUBLIC PAGE HANDLERS
   GET / and GET /about
   No DB queries — just render static views
   ======================================== */
exports.getHome = (req, res) => {
  res.render('index', { title: 'C.M.D. - Connect, Meet, Discover' });
};

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About Us' });
};

/* ========================================
   LOGIN
   GET  /login - render login form
   POST /login - look up user by email,
   bcrypt-compare password, check ban status,
   set session, redirect by role
   ======================================== */
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Email and password are required.');
      return res.redirect('/login');
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    if (user.isBanned) {
      req.flash('error', 'Your account has been banned.');
      return res.redirect('/login');
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.name;

    res.redirect(ROLE_REDIRECTS[user.role] || '/posts');
  } catch (err) {
    next(err);
  }
};

/* ========================================
   REGISTRATION
   GET  /register - render registration form
   POST /register - create user row in DB
   (password hashed via User beforeSave hook),
   start session, redirect to profile setup
   ======================================== */
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/login');
    }

    if (password.length < 8) {
      req.flash('error', 'Password must be at least 8 characters.');
      return res.redirect('/login');
    }

    const user = await User.create({ name, email, password });

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.name;

    res.redirect('/register/setup');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/login');
    }
    if (err.name === 'SequelizeValidationError') {
      req.flash('error', err.errors[0].message);
      return res.redirect('/login');
    }
    next(err);
  }
};

/* ========================================
   PROFILE SETUP (post-registration)
   GET  /register/setup - render interests/location form,
   fetching all categories from DB for pills
   POST /register/setup - save interests array and
   location string to the user row
   ======================================== */
exports.getSetup = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('auth/setup', { title: 'Set Up Your Profile', categories });
  } catch (err) { next(err); }
};

exports.postSetup = async (req, res, next) => {
  try {
    let interests = [];
    if (req.body.interests) {
      try { interests = JSON.parse(req.body.interests); } catch (_) { interests = []; }
    }
    if (!Array.isArray(interests) || interests.length === 0) {
      req.flash('error', 'Please select at least one interest.');
      return res.redirect('/register/setup');
    }
    const location = (req.body.location || '').trim() || null;
    await User.update({ interests, location }, { where: { id: req.session.userId } });
    res.redirect('/users/profile');
  } catch (err) { next(err); }
};

/* ========================================
   LOGOUT
   POST /logout
   Destroys the session, redirects to login
   ======================================== */
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
