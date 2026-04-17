const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', authController.getHome);
router.get('/about', (req, res) => res.render('about', { title: 'About Us' }));
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.post('/logout', authController.logout);

module.exports = router;
