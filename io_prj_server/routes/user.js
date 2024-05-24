var express = require('express');
var router = express.Router();
var user_controller = require('@controllers/user');

// Wyświetlanie formularza logowania
router.get('/login', function (req, res, next) {
    res.render('login');
});

// Wyświetlanie formularza rejestracji
router.get('/register', function (req, res, next) {
    res.render('register');
});

// Obsługa logowania
router.post('/login', user_controller.login);

// Obsługa rejestracji
router.post('/register', user_controller.register);

// Wylogowanie
router.get('/logout', user_controller.logout);

module.exports = router;
