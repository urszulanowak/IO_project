var express = require('express');
var router = express.Router();
var project_controller = require('@controllers/project');

router.get('/id/:id', project_controller.get_project);

router.get('/get_project_previews', project_controller.get_project_previews);

router.get('/create', function (req, res, next) {
    res.render('project_create', { user: req.user });
});

router.post('/publish', project_controller.publish);




module.exports = router;