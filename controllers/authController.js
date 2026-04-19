const bcrypt = require('bcrypt');
const { User, Category } = require('../models');

const ROLE_REDIRECTS = {
  community_member: '/users/profile',
  moderator: '/moderator/dashboard',
  admin: '/admin/users'
};

exports.getHome = (req, res) => {
  res.render('index', { title: 'C.M.D. - Connect, Meet, Discover' });
};

exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect(ROLE_REDIRECTS[req.session.role] || '/posts');
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

exports.getRegister = (req, res) => {
  if (req.session.userId) return res.redirect(ROLE_REDIRECTS[req.session.role] || '/posts');
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/register');
    }

    if (password.length < 8) {
      req.flash('error', 'Password must be at least 8 characters.');
      return res.redirect('/register');
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.name;

    res.redirect('/register/setup');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/register');
    }
    if (err.name === 'SequelizeValidationError') {
      req.flash('error', err.errors[0].message);
      return res.redirect('/register');
    }
    next(err);
  }
};

exports.getSetup = async (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('auth/setup', { title: 'Set Up Your Profile', categories });
  } catch (err) { next(err); }
};

exports.postSetup = async (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
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

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
