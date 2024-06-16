var project_model = require('@models/project');

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