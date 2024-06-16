var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('frontpage', { user: req.user });
});

router.get('/faq', function (req, res, next) {
  res.render('faq', { user: req.user });
});

router.get('/verify', function (req, res, next) {
  res.render('verify', { user: req.user });
});

router.get('/about', function (req, res, next) {
  res.render('about', { user: req.user });
});

router.get('/my-projects', function (req, res, next) {
  res.render('my_projects', { user: req.user });
});

router.get('/profile', function(req, res, next){
  res.render('profile', {user: req.user });
})

router.get('/followed-projects', function(req, res, next){
  res.render('followed_projects', {user: req.user});
})

module.exports = router;
