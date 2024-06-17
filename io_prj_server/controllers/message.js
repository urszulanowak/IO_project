var message_model = require('@models/message');
var ejs = require('ejs');

exports.get_message_room = function (req, res) {
    var user = req.user;
    if (!user) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    if (user.is_guest) {
        user.user_id = -1;
    }
    var room_id = req.params.room_id;
    message_model.authorize(user.user_id, room_id)
        .then(() => {
            ejs.renderFile('views/message_room.ejs', { authorized: true, is_guest: user.is_guest, room_id: room_id }).then(html => {
                res.status(200).send(html);
            });
        })
        .catch(err => {
            if (err.message == 'no access') {
                ejs.renderFile('views/message_room.ejs', { authorized: false, is_guest: user.is_guest, room_id: -1 }).then(html => {
                    res.status(200).send(html);
                });
            } else {
                console.log('Get message room error: ', err);
                res.status(500);
            }
        });
}

exports.get_messages_before = function (req, res) {
    var user = req.user;
    if (!user) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    if (user.is_guest) {
        user.user_id = -1;
    }
    var room_id = req.body.room_id;
    var before_id = req.body.before_id;
    var limit = req.body.limit;
    message_model.get_messages_before(user.user_id, room_id, before_id, limit)
        .then(messages => {
            ejs.renderFile('views/messages.ejs', { messages: messages }).then(html => {
                if (messages.length == 0) {
                    res.status(200).send({
                        html: '',
                        oldest_message_id: before_id,
                        newest_message_id: before_id
                    });
                    return;
                }
                res.status(200).send({
                    html: html,
                    oldest_message_id: messages[0].message_id,
                    newest_message_id: messages[messages.length - 1].message_id
                });
            });
        })
        .catch(err => {
            console.log('Get messages error: ', err);
            res.status(500);
        });
}

exports.get_messages_after = function (req, res) {
    var user = req.user;
    if (!user) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    if (user.is_guest) {
        user.user_id = -1;
    }
    var room_id = req.body.room_id;
    var after_id = req.body.after_id;
    var limit = req.body.limit;
    message_model.get_messages_after(user.user_id, room_id, after_id, limit)
        .then(messages => {
            if (messages.length == 0) {
                res.status(200).send({ html: '', newest_message_id: after_id });
                return;
            }
            ejs.renderFile('views/messages.ejs', { messages: messages }).then(html => {
                res.status(200).send({ html: html, newest_message_id: messages[messages.length - 1].message_id });
            });
        })
        .catch(err => {
            console.log('Get messages error: ', err);
            res.status(500);
        });
}

exports.add_message = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    var room_id = req.body.room_id;
    var text = req.body.text;
    message_model.add_message(user.user_id, room_id, text)
        .then(() => {
            res.status(200).send();
        })
        .catch(err => {
            console.log('Add message error: ', err);
            res.status(500);
        });
}