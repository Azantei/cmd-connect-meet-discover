const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const { redirectIfLoggedIn, requireAuth } = require('../middleware/auth');

router.get('/', authController.getHome);
router.get('/about', authController.getAbout);
router.get('/login', redirectIfLoggedIn, authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', redirectIfLoggedIn, authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/register/setup', requireAuth, authController.getSetup);
router.post('/register/setup', requireAuth, authController.postSetup);
router.post('/logout', authController.logout);

module.exports = router;
