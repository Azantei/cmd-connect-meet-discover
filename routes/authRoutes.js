const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const { redirectIfLoggedIn, requireAuth } = require('../middleware/auth');

/* ========================================
   PUBLIC PAGE ROUTES
   GET / - home landing page
   GET /about - about us page
   ======================================== */
router.get('/', authController.getHome);
router.get('/about', authController.getAbout);

/* ========================================
   LOGIN ROUTES
   GET  /login  - render login form (redirects if already logged in)
   POST /login  - authenticate credentials, set session, redirect by role
   ======================================== */
router.get('/login', redirectIfLoggedIn, authController.getLogin);
router.post('/login', authController.postLogin);

/* ========================================
   REGISTRATION ROUTES
   GET  /register        - render registration form
   POST /register        - create new user account, start session
   GET  /register/setup  - profile setup (interests + location) after signup
   POST /register/setup  - save interests + location, redirect to profile
   ======================================== */
router.get('/register', redirectIfLoggedIn, authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/register/setup', requireAuth, authController.getSetup);
router.post('/register/setup', requireAuth, authController.postSetup);

/* ========================================
   LOGOUT ROUTE
   POST /logout - destroy session, redirect to login
   ======================================== */
router.post('/logout', authController.logout);

module.exports = router;
