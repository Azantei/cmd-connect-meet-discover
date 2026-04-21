require('dotenv').config();
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');
const db = require('./models');

/* ========================================
   ROUTE IMPORTS
   One router module per feature area
   ======================================== */
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const moderatorRoutes = require('./routes/moderatorRoutes');

const app = express();

/* ========================================
   VIEW ENGINE
   EJS templates served from /views
   ======================================== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ========================================
   BODY PARSING & STATIC MIDDLEWARE
   Parses URL-encoded forms, JSON bodies,
   supports _method override for DELETE/PUT,
   and serves static assets from /public
   ======================================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

/* ========================================
   SESSION & FLASH
   24-hour cookie-backed session; flash
   messages stored per-request for redirects
   ======================================== */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(flash());

/* ========================================
   REQUEST LOCALS
   Injects session user info and flash
   messages into every EJS template
   ======================================== */
app.use(async (req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  res.locals.currentRole = req.session.role || null;
  res.locals.currentUsername = req.session.username || null;
  res.locals.success       = req.flash('success');
  res.locals.error         = req.flash('error');
  res.locals.reportSuccess = req.flash('reportSuccess');
  res.locals.loginError    = req.flash('loginError');
  res.locals.loginEmail    = req.flash('loginEmail')[0] || '';
  res.locals.catSuccess    = req.flash('catSuccess');
  res.locals.userWarnings  = [];
  if (req.session.userId) {
    try {
      const { UserWarning } = require('./models');
      res.locals.userWarnings = await UserWarning.findAll({
        where: { userId: req.session.userId, isRead: false },
        order: [['createdAt', 'DESC']]
      });
    } catch (_) { /* ignore — table may not exist yet on first boot */ }
  }
  next();
});

/* ========================================
   ROUTE MOUNTING
   Each router is scoped to its base path
   ======================================== */
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/events', eventRoutes);
app.use('/admin', adminRoutes);
app.use('/moderator', moderatorRoutes);

/* ========================================
   ERROR HANDLERS
   404 for unknown routes; 500 for thrown errors
   ======================================== */
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error', message: err.message });
});

/* ========================================
   DATABASE SYNC & SERVER START
   Sequelize syncs schema (alter:true updates
   columns without dropping data), then the
   Express server begins listening
   ======================================== */
const PORT = process.env.PORT || 3000;

db.sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced.');
  app.listen(PORT, () => console.log(`C.M.D. running on http://localhost:${PORT}`));
}).catch(err => console.error('DB sync failed:', err));
