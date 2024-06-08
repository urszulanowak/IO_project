var express = require('express');
var router = express.Router();
var user_controller = require('@controllers/user');
var notification_model = require('@models/notification');

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

// Odświeżenie JWT
router.post('/refresh_jwt', user_controller.refresh_jwt);
router.get('/login_expired_token', user_controller.refresh_jwt_fail);
router.get('/profile', user_controller.profile);
router.get('/notification', notification_model.get_user_notifications);

module.exports = router;
