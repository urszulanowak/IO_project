var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.user) {
    res.render('frontpage_user');
  } else {
    res.render('frontpage_guest');
  }
});

router.get('/faq', function (req, res, next) {
  res.render('faq');
});

router.get('/verify', function (req, res, next) {
  res.render('verify');
});

router.get('/about', function (req, res, next) {
  res.render('about');
});

module.exports = router;
