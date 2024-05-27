var project_model = require('@models/project');


exports.get_project = function (req, res) {
    var project_id = req.params.id;
    project_model.get_project(project_id).then(project => {
        res.render('project_view', { user: req.user, project: project });
    }).catch(err => {
        switch (err.message) {
            case 'project not found':
                res.status(404);
                break;
            default:
                console.log('Get project error: ', err);
                res.status(500);
                break;
        }
    });
};

exports.publish = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.status(401).send('Unauthorized');
        return;
    }
    var title = req.body.title;
    var description = req.body.description;
    project_model.publish(user.user_id, title, description).then(id => {
        res.status(200).send(id);
    }).catch(err => {
        switch (err.message) {
            case 'title too short':
                res.status(400).send('Title is too short!');
                break;
            case 'description too short':
                res.status(400).send('Description is too short!');
                break;
            default:
                console.log('Publish project error: ', err);
                res.status(500).send('Server error.');
                break;
        }
    });
}