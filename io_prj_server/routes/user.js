var express = require('express');
var router = express.Router();
var user_controller = require('@controllers/user');

router.get('/login', function (req, res, next) {
    res.render('login');
});
router.get('/register', function (req, res, next) {
    res.render('register');
});

router.post('/login', user_controller.login);
router.post('/register', user_controller.register);

module.exports = router;
