var project_model = require('@models/project');
var recommend_model = require('@models/recommend');
var ejs = require('ejs');


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

exports.join_project = function (req, res) {
    var project_id = req.params.id;
    project_model.get_project(project_id).then(project => {
        res.render('project_join', { project: project });
    }).catch(err => {
        switch (err.message) {
            case 'project not found':
                res.status(404);
                break;
            default:
                console.log('Join project error: ', err);
                res.status(500);
                break;
        }
    });
};

exports.get_project_previews = function (req, res) {

    if (req.session.seen_projects === undefined) {
        req.session.seen_projects = [];
    }
    var seen_projects = req.session.seen_projects;

    recommend_model.recommend(5, req.user ? req.user.user_id : null, seen_projects).then(recommended_projects => {
        if (recommended_projects.length == 0) {
            req.session.seen_projects = [];
            res.status(200).send();
        } else {
            req.session.seen_projects = seen_projects.concat(recommended_projects);
            project_model.get_project_previews(recommended_projects).then(project_previews => {
                ejs.renderFile('views/project_previews.ejs', { project_previews: project_previews }).then(html => {
                    res.status(200).send(html);
                });
            });
        }
    }).catch(err => {
        console.log('Get project previews error: ', err);
        res.status(500);
    });
}


exports.get_my_project_previews = function (req, res) {
    var user = req.user;
    project_model.get_project_previews_by_user_id(user.user_id)
        .then(project_previews => {
            ejs.renderFile('views/project_previews.ejs', { project_previews: project_previews }).then(html => {
                res.status(200).send(html);
            });
        })
        .catch(err => {
            console.log('Get my projects error: ', err);
            res.status(500);
        });
};



exports.publish = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    var title = req.body.title;
    var description = req.body.description;
    project_model.publish(user.user_id, title, description).then(id => {
        res.status(200).send(id);
    }).catch(err => {
        switch (err.message) {
            case 'title too short':
                res.statusMessage = 'Title is too short!';
                res.status(400).send();
                break;
            case 'description too short':
                res.statusMessage = 'Description is too short!';
                res.status(400).send();
                break;
            default:
                console.log('Publish project error: ', err);
                res.statusMessage = 'Server error.';
                res.status(500).send();
                break;
        }
    });
}

exports.join_request = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    var project_id = req.params.id;
    var message = req.body.message;
    project_model.join_request(user.user_id, project_id, message).then(() => {
        res.status(200).send();
    }).catch(err => {
        switch (err.message) {
            case 'message too short':
                res.statusMessage = 'Message is too short!';
                res.status(400).send();
                break;
            case 'already member':
                res.statusMessage = 'Already a member!';
                res.status(400).send();
                break;
            case 'request denied':
                res.statusMessage = 'Request denied!';
                res.status(400).send();
                break;
            case 'request pending':
                res.statusMessage = 'Request pending!';
                res.status(400).send();
                break;
            default:
                console.log('Join request error: ', err);
                res.statusMessage = 'Server error.';
                res.status(500).send();
                break;
        }
    });
}