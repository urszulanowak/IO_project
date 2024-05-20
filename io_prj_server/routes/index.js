var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('guest');
});

router.get('/logged', function(req, res, next) {
  res.render('logged'); 
});

router.get('/faq', function(req, res, next) {
  res.render('faq');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/verify', function(req, res, next) {
  res.render('verify');
});

router.get('/about', function(req, res, next) {
  res.render('about');
});

module.exports = router;
