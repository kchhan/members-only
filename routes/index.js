const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');

/* GET home page. */
router.get('/', index_controller.index);
router.post('/', index_controller.index_post);

// sign up
router.get('/sign-up', index_controller.sign_up_get);
router.post('/sign-up', index_controller.sign_up_post);

// log in
router.get('/login', index_controller.login_get);
router.post('/login', index_controller.index_post);

// secret code
router.get('/code', index_controller.code_get);
router.post('/code', index_controller.code_post);

// log out
router.get('/logout', index_controller.logout_get);

module.exports = router;
