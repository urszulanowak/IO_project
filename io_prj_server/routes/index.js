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

router.get('/project_view', function (req, res, next) {
  res.render('project_view', { user: req.user });
});

router.get('/project_create', function (req, res, next) {
  res.render('project_create', { user: req.user });
});

router.get('/project_list', function (req, res, next) {
  res.render('project_list', { user: req.user });
});

module.exports = router;
