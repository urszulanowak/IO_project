var express = require('express');
var router = express.Router();
var project_controller = require('@controllers/project');

router.get('/id/:id', project_controller.get_project);

router.get('/get_project_previews', project_controller.get_project_previews);

router.get('/create', function (req, res, next) {
    res.render('project_create', { user: req.user });
});


router.get('/my-projects', async (req, res) => {
  try {
      const user = req.user; // Assuming req.user contains the logged-in user's data
      
      const allProjects = await db.request()
          .query('SELECT * FROM [dbo].[project]')
          .then(result => result.recordset);

      const myProjects = allProjects.filter(project => project.user_id === user.user_id);
      const myProjectIds = myProjects.map(project => project.project_id);

      const myProjectPreviews = await projectModel.get_project_previews(myProjectIds);
      res.render('my_projects', { user: user, myProjects: myProjectPreviews });
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

router.post('/publish', project_controller.publish);




module.exports = router;