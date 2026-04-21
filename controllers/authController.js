const { authenticateByEmailPassword, registerUser, getSetupCategories, saveProfileSetup } = require('../services/authService');

const ROLE_REDIRECTS = {
  community_member: '/users/profile',
  moderator: '/moderator/dashboard',
  admin: '/admin/users'
};

exports.getHome = (req, res) => {
  res.render('index', { title: 'C.M.D. - Connect, Meet, Discover' });
};

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About Us' });
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('loginError', 'Email and password are required.');
      req.flash('loginEmail', email || '');
      return res.redirect('/login');
    }
    const authResult = await authenticateByEmailPassword(email, password);
    if (!authResult.ok && authResult.reason === 'invalid_credentials') {
      req.flash('loginError', 'Invalid email or password.');
      req.flash('loginEmail', email);
      return res.redirect('/login');
    }
    if (!authResult.ok && authResult.reason === 'banned') {
      req.flash('loginError', 'Your account has been banned.');
      req.flash('loginEmail', email);
      return res.redirect('/login');
    }
    const user = authResult.user;
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.name;
    res.redirect(ROLE_REDIRECTS[user.role] || '/posts');
  } catch (err) { next(err); }
};

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
    const user = await registerUser(name, email, password);
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

exports.getSetup = async (req, res, next) => {
  try {
    const categories = await getSetupCategories();
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
    await saveProfileSetup(req.session.userId, interests, (req.body.location || '').trim());
    res.redirect('/users/profile');
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
