var express = require('express');
var router = express.Router();
const userRoutes = require('./user');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.user.is_guest) {
    res.render('frontpage_guest');
  } else {
    res.render('frontpage_user');
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

router.use('/user', userRoutes);

module.exports = router;
