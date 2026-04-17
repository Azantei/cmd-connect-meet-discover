const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.getHome = (req, res) => {
  res.render('index', { title: 'C.M.D. - Connect, Meet, Discover' });
};

exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/users/profile');
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
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
    req.session.username = user.username;
    res.redirect('/users/profile');
  } catch (err) {
    next(err);
  }
};

exports.getRegister = (req, res) => {
  if (req.session.userId) return res.redirect('/users/profile');
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    await User.create({ username, email, password: hash });
    req.flash('success', 'Account created! Please log in.');
    res.redirect('/login');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'Email or username already in use.');
      return res.redirect('/register');
    }
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
