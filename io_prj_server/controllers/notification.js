var notification_model = require('@models/notification');
var ejs = require('ejs');

exports.get_user_notifications = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    notification_model.get_user_notifications(user.user_id)
        .then(notifications => {
            ejs.renderFile('../views/notifications.ejs', { notifications: notifications }).then(html => {
                res.status(200).send(html);
            });
        })
        .catch(err => {
            console.log('Get notifications error: ', err);
            res.status(500);
        });
}