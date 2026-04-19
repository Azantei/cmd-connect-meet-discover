const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

router.get('/', authController.getHome);
router.get('/about', authController.getAbout);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/register/setup', authController.getSetup);
router.post('/register/setup', authController.postSetup);
router.post('/logout', authController.logout);

module.exports = router;
