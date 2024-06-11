var project_model = require('@models/project');
var recommend_model = require('@models/recommend');
var project_tag_model = require('@models/project_tag');
var ejs = require('ejs');
const { get_project } = require('../models/project');


exports.get_project = function (req, res) {
    var project_id = req.params.id;
    project_model.get_project(project_id).then(project => {
        res.render('project_view', { user: req.user, project: project, tags: project.tags });
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

function get_project_previews(req, res) {
    if (req.session.seen_projects === undefined) {
        req.session.seen_projects = [];
    }
    var seen_projects = req.session.seen_projects;

    recommend_model.recommend(5, req.user ? req.user.user_id : null, seen_projects).then(recommended_projects => {
        if (recommended_projects.length == 0) {
            req.session.seen_projects = [];
            get_project_previews(req, res);
        } else {
            req.session.seen_projects = seen_projects.concat(recommended_projects);
            project_model.get_project_previews(recommended_projects).then(project_previews => {
                ejs.renderFile('../views/project_previews.ejs', { project_previews: project_previews }).then(html => {
                    res.status(200).send(html);
                });
            });
        }
    }).catch(err => {
        console.log('Get project previews error: ', err);
        res.status(500);
    });
}
exports.get_project_previews = get_project_previews;

exports.get_my_project_previews = function (req, res) {
    var user = req.user;
    project_model.get_project_previews_by_user_id(user.user_id)
        .then(project_previews => {
            ejs.renderFile('../views/project_previews.ejs', { project_previews: project_previews }).then(html => {
                res.status(200).send(html);
            });
        })
        .catch(err => {
            console.log('Get my projects error: ', err);
            res.status(500);
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



exports.publish = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    var title = req.body.title;
    var description = req.body.description;
    var tags = req.body.tags;
    project_model.publish(user.user_id, title, description, tags).then(id => {
        res.status(200).send(id);
    }).catch(err => {
        switch (err.message) {
            case 'title too short':
                res.status(400).send('Tytuł jest zbyt krótki!');
                break;
            case 'description too short':
                res.status(400).send('Opis jest zbyt krótki!');
                break;
            default:
                console.log('Publish project error: ', err);
                res.status(500).send('Błąd serwera.');
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
    var project_id = req.body.project_id;
    var message = req.body.message;
    project_model.join_request(user.user_id, project_id, message).then(() => {
        res.status(200).send();
    }).catch(err => {
        switch (err.message) {
            case 'message too short':
                res.status(400).send('Wiadomość jest zbyt krótka!');
                break;
            case 'message too long':
                res.status(400).send('Wiadomość jest zbyt długa!');
                break;
            case 'already member':
                res.status(400).send('Jesteś już członkiem tego projektu!');
                break;
            case 'request denied':
                res.status(400).send('Twoje zgłoszenie zostało odrzucone!');
                break;
            case 'request pending':
                res.status(400).send('Zgłoszenie w trakcie rozpatrywania!');
                break;
            default:
                console.log('Join request error: ', err);
                res.status(500).send('Błąd serwera.');
                break;
        }
    });
}

exports.project_create = async function (req, res) {
    try {
        const tags = await project_tag_model.get_all_tags();

        const categorizedTags = {
            language: [],
            technology: [],
            license: []
        };

        tags.forEach(tag => {
            switch (tag.category_id) {
                case 1:
                    categorizedTags.language.push(tag);
                    break;
                case 2:
                    categorizedTags.technology.push(tag);
                    break;
                case 3:
                    categorizedTags.license.push(tag);
                    break;
            }
        });

        res.render('project_create', { user: req.user, tags: categorizedTags });
    } catch (err) {
        console.log('Get all tags error: ', err);
        res.status(500).send('Server error.');
    }
};

