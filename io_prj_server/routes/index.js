var express = require('express');
var router = express.Router();

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

router.get('/project_view', function (req, res, next) {
  res.render('project_view');
});

router.get('/project_create', function (req, res, next) {
  res.render('project_create');
});

router.get('/project_list', function (req, res, next) {
  res.render('project_list');
});

module.exports = router;
