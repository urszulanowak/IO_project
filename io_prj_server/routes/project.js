var express = require('express');
var router = express.Router();
var project_controller = require('@controllers/project');
var project_join_controller = require('@controllers/project_join');

router.get('/id/:id', project_controller.get_project);

router.get('/get_project_previews', project_controller.get_project_previews);

router.get('/get_my_projects', project_controller.get_my_project_previews);

router.get('/create', project_controller.project_create);

router.post('/publish', project_controller.publish);

router.get('/join/:id', project_join_controller.join_project);

router.post('/join', project_join_controller.join_request);


module.exports = router;